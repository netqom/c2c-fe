import { useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import SweetAlert from "react-bootstrap-sweetalert";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { callCommonAction } from "../../redux/Common/CommonReducer";
import appSettings from "../../configs/AppConfig";
import axios from 'axios';
import STRINGS from "../../common/strings/strings";
import Helper from "../../apis/Helper";
import appRoutes from "../../configs/AppRoutes";

// This values are the props in the UI
const style = { "layout": "vertical" };

// Custom component to wrap the PayPalButtons and handle currency changes
const PayPalButtonsComponent = ({ slug, productData, currency, showSpinner, amount, checkFormIsValid, rerenderParentByChild, adminCommission, toastMessage, saveOrder, savePayout }) => {
    // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
    const navigate = useNavigate();
    const { alert } = useSelector((state) => state.common);
    const dispatchRedux = useDispatch()

    useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: currency,
            },
        });
    }, [currency, showSpinner]);

    const createOrder = async (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: (parseFloat(amount) + parseFloat(productData.delivery_price)).toFixed(2),
                    },
                },
            ]
        })
            .then((orderId) => {
                // Your code here after create the order
                return orderId;
            });
    }

    const onApprove = async (data, actions) => {
        return await actions.order.capture().then(async function (order) {
            
            console.log('order.capture => res', order)

            const actualAdminCommissionAmount = ((parseFloat(productData.price) * (parseFloat(adminCommission))) / (parseFloat(100)));
            const amountThatNeedToPayPayee = (parseFloat(productData.price)) - (parseFloat(actualAdminCommissionAmount));
            //amountThatNeedToPayPayee = amountThatNeedToPayPayee.toFixed(2);
            const prepareDataForCreateOrder = {
                uuid: order.id,
                intent: order.intent,
                payer_email: order.payer.email_address,
                payer_id: order.payer.payer_id,
                amount: parseFloat(order.purchase_units[0].amount.value),
                price: parseFloat(amount),
                payee_email: order.purchase_units[0].payee.email_address,
                merchant_id: order.purchase_units[0].payee.merchant_id,
                capture_id: order.purchase_units[0].payments.captures[0].id,
                payment_status: order.purchase_units[0].payments.captures[0].status,
                product_id: productData.id,
                quantity: 1,
                admin_commission_setting_value: parseInt(adminCommission),
                admin_commission_value: parseFloat(actualAdminCommissionAmount),
                payment_method: 2,
                currency: currency,
                status: order.status,
                product_owner: productData.created_by,
                delivery_price: productData.delivery_price
            };
         
            console.log('prepareDataForCreateOrder',prepareDataForCreateOrder,'amountThatNeedToPayPayee',amountThatNeedToPayPayee)
            let orderRes = await saveOrder(prepareDataForCreateOrder);
            await createAndClaimedPayout(orderRes,amountThatNeedToPayPayee);
            // Your code here after capture the order
        });
    }



    const createAndClaimedPayout = async (order,amountThatNeedToPayPayee) => {
        dispatchRedux(callCommonAction({ loading: true }))
        const authTokenForPaypal = await Helper.generatePaypalAccessToken();

        const headerData = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authTokenForPaypal}` } };

        const payoutData = {
            sender_batch_header: {
                sender_batch_id: "Payouts_" + Math.random().toString(36).substring(9),
                email_subject: "You have a payout!",
                email_message: "You have received a payout! Thanks for using our service!"
            },
            items: [
                {
                    recipient_type: "EMAIL",
                    amount: {
                        value: parseFloat(amountThatNeedToPayPayee).toFixed(2),
                        currency: currency,
                    },
                    receiver: productData.users.paypal_email,
                    note: "Thanks for your support!",
                },
            ],
        };
        let data = { currency: currency, amount: parseFloat(amountThatNeedToPayPayee).toFixed(2), order_id: order.data.data.id, payout_batch_id: null, batch_status: null, payout_item_id: null, transaction_id: null, transaction_status: null, receiver: null };
        await axios.post(`${appSettings.paypalSandBoxUrl}/v1/payments/payouts`, payoutData, headerData)
            .then(async (response) => {
                console.log('payout create',response)
                
                data.payout_batch_id = response.data.batch_header.payout_batch_id;
                data.batch_status = response.data.batch_header.batch_status;

                if (data.batch_status == 'PENDING') {
                    await axios.get(`${appSettings.paypalSandBoxUrl}/v1/payments/payouts/${data.payout_batch_id}`, headerData)
                        .then(async (showPayoutBatchRes) => {

                            console.log('showPayoutBatchRes', showPayoutBatchRes)

                            data.batch_status = showPayoutBatchRes.data.batch_header.batch_status;
                            data.payout_item_id = showPayoutBatchRes.data.items[0].payout_item_id;
                            await axios.get(`${appSettings.paypalSandBoxUrl}/v1/payments/payouts-item/${data.payout_item_id}`, headerData)
                                .then((showPayoutItemDetail) => {

                                    data.transaction_id = showPayoutItemDetail.data.transaction_id;
                                    data.transaction_status = showPayoutItemDetail.data.transaction_status;
                                    data.receiver = showPayoutItemDetail.data.payout_item.receiver;
                                    dispatchRedux(callCommonAction({ loading: false }))
                                    //console.log('showPayoutItemDetail', showPayoutItemDetail)
                                    savePayout(data);
                                    toastMessage(STRINGS.product.thankYouForPurchase, 'success');
                                    navigate(appRoutes.myOrdersRoute); 
                                    
                                }).catch((err) => {
                                    savePayout(data);
                                    onError('Oops, There is problem from paypal side.')
                                    dispatchRedux(callCommonAction({ loading: false }))
                                    console.log('err /payments/payouts-item/', err);
                                })

                        }).catch((err) => {
                            savePayout(data);
                            onError({})
                            dispatchRedux(callCommonAction({ loading: false }))
                            console.log('err payments/payouts/${data.payout_batch_id}', err);
                        })
                }
            })
            .catch(error => {
                onError({})
                dispatchRedux(callCommonAction({ loading: false }))
                console.log('error /payments/payouts', error)
            });
    }

    const onError = async (err) => {
        const custom = (
            <SweetAlert
                error
                confirmBtnText="Cancel"
                confirmBtnBsStyle="danger"
                title={err}
                onConfirm={() => {
                    dispatchRedux(callCommonAction({ alert: null }))
                    rerenderParentByChild()
                }}
                focusCancelBtn
                btnSize='sm'
                imageHeight='60px!important'
                imageWidth='60px!important'
                customClass='swal-style icon-class'
            >
            </SweetAlert>
        )
        dispatchRedux(callCommonAction({ alert: custom }));
    }

    /** Before Open pop up check validation of checkout form on click paypal button */
    const onClick = async (data, actions) => {
        const response = await checkFormIsValid('');
        if (!response) {
            return actions.reject();
        }
    }

    const onInit = async (data, actions) => console.log('checkout => onInit', data, actions)

    const onCancel = async (data, actions) => console.log('checkout => onCancel', data, actions)

    return (
        <>
            {alert}
            {(showSpinner && isPending) && <div className="spinner" />}
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[amount, currency, style]}
                fundingSource={undefined}
                createOrder={(data, actions) => createOrder(data, actions)}
                onApprove={(data, actions) => onApprove(data, actions)}
                onCancel={(data, actions) => onCancel(data, actions)}
                onClick={(data, actions) => onClick(data, actions)}
                onError={(err) => onError('Oops, There is problem from paypal side.Please click refresh button')}
                onInit={(data, actions) => onInit(data, actions)}
            />
        </>
    );
}

export default PayPalButtonsComponent;