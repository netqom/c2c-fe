import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import appRoutes from '../../configs/AppRoutes';
import { sendRequest } from '../../apis/APIs';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from 'react-redux';
import { callCommonAction } from '../../redux/Common/CommonReducer';

const StripeCheckoutForm = ({ productData, options }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [disabledButton, setDisabledButton] = useState(false);
  const clientSecret = options.clientSecret;

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

  }, [stripe]);

  const callApiToSaveOrder = async (paymentIntent) => {
    let order = Object.assign({}, productData);
    //console.log('paymentIntent', paymentIntent)
    order.type = 'stripe';
    order.amount = (paymentIntent.amount / 100);
    order.payment_intent_id = paymentIntent.id;
    order.product_id = order.id;
    order.product_title = order.title;
    order.currency = paymentIntent.currency;
    order.product_owner = order.created_by;
    order.payment_method = paymentIntent.payment_method;
    order.status = paymentIntent.status;
    order.object = paymentIntent.object;

    try {
      setDisabledButton(true)
      await sendRequest(`/save-order`, 'POST', order);
      setDisabledButton(false)
      toast.success("Payment succeeded!");
      navigate(appRoutes.authPrfixRoute + '/' + appRoutes.myOrdersRoute)
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      setDisabledButton(false)
      toast.error("Something went wrong.");
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    dispatch(callCommonAction({ loading: true }));

    const { paymentIntent, error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: `http://localhost:6013/auth/my-orders` }, redirect: 'if_required' });

    if (error) {
      toast.error(error.message);
      dispatch(callCommonAction({ loading: false }));
    } else if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
      callApiToSaveOrder(paymentIntent);
    } else if (paymentIntent === 'requires_payment_method') {
      toast.error("Your payment was not successful, please try again.");
      elements.clear()
      dispatch(callCommonAction({ loading: false }));
    } else {
      toast.error("Something went wrong.");
      elements.clear()
      dispatch(callCommonAction({ loading: false }));
    }
  };

  return (
    <form>
      <PaymentElement />
      <div className='text-center'>
        {
          !stripe || disabledButton === true
            ?
            <button type="button" className='btn btn-primary btn-s mt-4 px-5 mx-auto w-100 fw-bold disabled-btn' >Pay</button>
            :
            <button type="button" className={`btn btn-primary btn-s mt-4 px-5 mx-auto w-100 fw-bold`} onClick={(e) => handleSubmit(e)} >Pay {disabledButton}</button>
        }
      </div>
    </form>

  )
};

export default StripeCheckoutForm;