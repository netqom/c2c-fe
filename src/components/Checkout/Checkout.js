import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card';
import { useDispatch, useSelector } from 'react-redux';
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import appSettings from '../../configs/AppConfig';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import ButtonWrapper from '../Common/PayPalButtonsComponent'
import appRoutes from '../../configs/AppRoutes';
import { toast } from 'react-toastify';
import STRINGS from '../../common/strings/strings';
import { validateCheckoutFormData } from './Validation';
import { ContentLoading } from '../Common/ContentLoading';
import { Helmet } from 'react-helmet';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckoutForm from '../Common/StripeCheckoutForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(appSettings.stripeKey);

const Checkout = ({ route }) => {
   const { user, loading } = useSelector((state) => state.common);
   const currency = "GBP";
   const [errorsInfo, setErrorsInfo] = useState({});
   const { slug } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const [checkoutDetail, setCheckoutDetail] = useState([]);
   const [billingDetail, setBillingDetail] = useState({ name: user.name, email: user.email, address: user.address, phone: user.phone });
   const [rerenderParent, setRerenderParent] = useState(false);
   const [clientSecret, setClientSecret] = useState("");
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const [originalAmt, setOriginalAmt] = useState(0.00);

   useEffect(() => {
      if (Object.keys(user).length === 0) { // If not loggedin stop calling api and return to logged in
         const abortController = new AbortController();
         toast.error(STRINGS.loginFirstBeforeCheckout)
         navigate(appRoutes.loginRoute, { state: { slug: slug } });
         return () => {
            abortController.abort()
         }
      }
      callApiToGetCheckoutDetail()
   }, [rerenderParent]);

   // Create PaymentIntent as soon as the page loads
   const createPaymentIntent = async (amount) => {
      try {
         //dispatch(callCommonAction({ loading: true }));
         const res = await sendRequest(`/create-payment-intent`, 'POST', { amount: amount, currency: currency });
         setClientSecret(res.data.data.clientSecret);
         //dispatch(callCommonAction({ loading: false }));
      } catch (error) {
         dispatch(callCommonAction({ loading: false }));
      }
   }

   /*** Get detail for checkout page */
   const callApiToGetCheckoutDetail = async () => {
      try {
         const chatId = queryParams.get('chat_id');
         dispatch(callCommonAction({ loading: true }));
         const res = await sendRequest(`/get-checkout-detail`, 'POST', { slug: slug, chat_id: chatId });
         setOriginalAmt(res.data.data.price);
         if (res.data.data.chat_offer !== null && res.data.data.chat_offer.hasOwnProperty('offer_amt')) {  //If user has chat offer then update the price of product for this page only
            res.data.data.price = res.data.data.chat_offer.offer_amt
         }

         setCheckoutDetail(res.data.data);
         if (user.id == res.data.data.created_by) { //Owner does not purchase their own product
            navigate('/' + appRoutes.productSearchListRoute, { state: { message: STRINGS.product.cantBuyOwnProduct } })
            return
         }

         if (res.data.status) {
            let amt = (parseFloat(res.data.data.price) + parseFloat(res.data.data.delivery_price)).toFixed(2);
            if (res.data.data.chat_offer !== null && res.data.data.chat_offer.hasOwnProperty('offer_amt')) {  //If user has chat offer then send its amt 
               //console.log('ssss')
               amt = (parseFloat(res.data.data.chat_offer.offer_amt) + parseFloat(res.data.data.delivery_price)).toFixed(2);
            }
            //console.log('a', amt)
            amt = (amt * 100);
            await createPaymentIntent(amt);
         }
         dispatch(callCommonAction({ loading: false }));
      } catch (error) {
         //console.log('as', error)
         dispatch(callCommonAction({ loading: false }));
         navigate('/' + appRoutes.productSearchListRoute)
      }
   }

   /** Check Length Of Product Detail Arry */
   const checkoutDetailLength = () => checkoutDetail.hasOwnProperty('id') ? true : false;

   /** Implemented Validation For Checkout Form */
   const checkFormIsValid = async (fieldName) => {
      const res = validateCheckoutFormData(billingDetail, fieldName);
      setErrorsInfo(res.errors);
      return res.formVaildCheck;
   }

   /** OnChange Update Input Values */
   const handleChange = (e) => {
      billingDetail[e.target.name] = e.target.value;
      setBillingDetail(billingDetail);
      /**Single Single FieldName Validation Check */
      checkFormIsValid(e.target.name)
   }

   /** Create Order Function Available */
   const saveOrder = async (order) => {
      try {
         const res = await sendRequest(`/save-order`, 'POST', order);
         return res;
      } catch (error) {
      }
   }

   /** Create Payout Function Available */
   const savePayout = async (payout) => {
      try {
         const res = await sendRequest(`/save-payout`, 'POST', payout);
      } catch (error) {
      }
   }

   const rerenderParentByChild = () => { setRerenderParent((prevState) => !prevState); }

   const toastMessage = (message, type) => { toast[type](message); }

   const appearance = { theme: 'stripe' };
   const options = { clientSecret, appearance };


   return (
      <>
         <Helmet>
            <title>Alium | Checkout Page</title>
            <meta name="description" content="Checkout page Description Goes Here" />
            <meta name="keywords" content="Game, Entertainment, Movies" />
         </Helmet>

         <div className='inner-page'>
            {/* {console.log('checkoutDetail', checkoutDetail)} */}
            <div className='container'>
               <button className="btn btn-primary btn-sm mb-2" onClick={() => location.state != null ? navigate('/'+appRoutes.dashboardRoute) : navigate(-1)}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
                  <div className='row'>
                     {loading ? <div className='' style={{ minHeight: '600px' }}><ContentLoading /></div> : null}
                     <div className='col-md-3 order-md-2 mb-4'>
                        <div className='sidebar-wrap'>
                           <h4 className="neon-clr"><span>Your Order</span></h4>
                           <hr />
                           <div className="d-flex mb-2">
                              <h5 className="inline">Product</h5>
                              <h5 className="inline ms-auto">Total</h5>
                           </div>
                           <div className="prod-description d-flex mb-2">
                              <span className='pro-name'> {
                                                checkoutDetailLength()
                                                   ?
                                                   checkoutDetail.chat_offer !== null && checkoutDetail.chat_offer.hasOwnProperty('offer_amt')
                                                      ?
                                                      'Offered Price'
                                                      :
                                                      'Original Price'
                                                   :
                                                   null
                                             }</span>
                              <span className='ms-auto pro-price ps-2'>£{checkoutDetailLength() ? checkoutDetail.chat_offer !== null && checkoutDetail.chat_offer.hasOwnProperty('offer_amt') ? checkoutDetail.chat_offer.offer_amt : checkoutDetail.price : 0.00}</span>
                           </div>
                           <div className="prod-description d-flex mb-2">
                              <span className='pro-name'>{`Shipping Fee`} </span>
                              {/* <div className="qty inline f-bold fw-bold light-purple ms-2 text-nowrap"> {checkoutDetailLength() ? checkoutDetail.delivery_price : ''} </div> */}
                              <span className='ms-auto pro-price ps-2'>£{checkoutDetailLength() ? checkoutDetail.delivery_price.toFixed(2) : ''}</span>
                           </div>
                           <hr />
                           <div className='d-flex'>
                              <h5>Order Total</h5>
                              <h5 className='ms-auto'>£{checkoutDetailLength() ? checkoutDetail.chat_offer !== null && checkoutDetail.chat_offer.hasOwnProperty('offer_amt') ? (parseFloat(checkoutDetail.chat_offer.offer_amt) + parseFloat(checkoutDetail.delivery_price)).toFixed(2) : (parseFloat(checkoutDetail.price) + parseFloat(checkoutDetail.delivery_price)).toFixed(2) : ''}</h5>
                           </div>
                           <hr />
                           <div className='mt-5'>
                              <h5 className="topborder mb-3 neon-clr"><span>Payment Method </span></h5>
                              {
                                 clientSecret ?
                                    <Elements options={options} stripe={stripePromise}>
                                       <StripeCheckoutForm productData={checkoutDetail} options={options} />
                                    </Elements>
                                    :
                                    null
                              }
                           </div>

                           {/* <hr />
                           <div className='payment-form' style={{ maxWidth: "750px", minHeight: "150px" }}>
                              <PayPalScriptProvider options={{ "client-id": appSettings.paypalClientId, components: "buttons", currency: currency }} >
                                 <ButtonWrapper
                                    rerenderParentByChild={rerenderParentByChild}
                                    currency={currency}
                                    showSpinner={false}
                                    amount={checkoutDetailLength() ? checkoutDetail.price : '0'}
                                    productData={checkoutDetail}
                                    checkFormIsValid={checkFormIsValid}
                                    adminCommission={checkoutDetailLength() ? checkoutDetail.admin_commision : 0}
                                    toastMessage={toastMessage}
                                    slug={slug}
                                    saveOrder={saveOrder}
                                    savePayout={savePayout}
                                 />
                              </PayPalScriptProvider>
                           </div> */}
                        </div>
                     </div>
                     <div className='col-md-9'>
                        <div className='card-cstm'>
                           <Card className='flex-md-row p-2 flex-md-row p-3 bg-transparent cart-item'>
                              <div className='col-md-2'>
                                 <Card.Img height={150} variant="top" src={checkoutDetailLength() ? checkoutDetail.display_path : ''} />
                              </div>
                              <div className='col-md-10'>
                                 <Card.Body>
                                    <div className='small text-white'>{checkoutDetailLength() ? checkoutDetail.product_categories.map((pCat) => pCat.category.name).join(', ') : ''}</div>
                                    <Card.Title className='p-0 border-0 fs-5 mb-2'>{checkoutDetailLength() ? checkoutDetail.title : ''}</Card.Title>
                                    <Card.Text>
                                       <div className='d-flex'>
                                          <div className=''>
                                             <div className='text-white mb-0'>Original Price: <span className='neon-clr'>£{checkoutDetailLength() ? originalAmt : 0.00}</span></div>
                                             {
                                                checkoutDetailLength()
                                                   ?
                                                   checkoutDetail.chat_offer !== null && checkoutDetail.chat_offer.hasOwnProperty('offer_amt')
                                                      ?
                                                      <div className='text-white'>Offered Price: <span className='neon-clr'>£{checkoutDetail.chat_offer.offer_amt}</span></div>
                                                      :
                                                      null
                                                   :
                                                   null
                                             }
                                          </div>
                                       </div>
                                    </Card.Text>
                                 </Card.Body>
                              </div>
                           </Card>
                           <hr />
                           <div className="form-content p-4">
                              <h3 className="mb-4"><span>Billing Details</span></h3>
                              <div className='row'>
                                 <div className="col-md-6 form-group">
                                    <label for="fname">Full name</label>
                                    <input className="form-control" type="text" name="name" id="fname" onChange={handleChange} value={billingDetail.name} required="" readOnly style={{ cursor: 'not-allowed' }} />
                                    <span className='invalid-field'>{errorsInfo.name}</span>
                                 </div>
                                 <div className="col-md-6 form-group">
                                    <label for="email">Email</label>
                                    <input className="form-control" type="text" name="email" id="email" onChange={handleChange} value={billingDetail.email} required="" readOnly style={{ cursor: 'not-allowed' }} />
                                    <span className='invalid-field'>{errorsInfo.email}</span>
                                 </div>
                              </div>
                              <div className='row'>
                                 <div className="col-md-6 form-group">
                                    <label for="tel">Phone</label>
                                    <input className="form-control" type="text" name="phone" id="tel" onChange={handleChange} value={billingDetail.phone} required="" readOnly style={{ cursor: 'not-allowed' }} />
                                    <span className='invalid-field'>{errorsInfo.phone}</span>
                                 </div>
                                 <div className="col-md-6 form-group">
                                    <label for="address">Address</label>
                                    <input className="form-control mb-2" type="text" name="address" onChange={handleChange} value={billingDetail.address} id="address" required="" readOnly style={{ cursor: 'not-allowed' }} />
                                    <span className='invalid-field'>{errorsInfo.address}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
            </div>
         </div>
      </>
   )
}

export default Checkout