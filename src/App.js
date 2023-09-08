import React, { Suspense, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import appRoutes from './configs/AppRoutes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { callCommonAction } from './redux/Common/CommonReducer';
import SocketContext from './apis/socket-context';
import appSettings from './configs/AppConfig';
import { io } from "socket.io-client";




// Pages
import ProductList from './components/Product/ProductList/ProductList';
import Login from './components/Login/Login';
import NoRouteFound from './components/NoRouteFound';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ResetPassword from './components/ResetPassword/ResetPassword';
import Register from './components/Register/Register';
import ProductDetail from './components/Product/ProductDetail/ProductDetail';
import Home from './components/Home/Home';
import AddEditProduct from './components/Product/AddEditProduct/AddEditProduct';
import SoldProduct from './components/Product/SoldProductList/SoldProductList';
import MyOrderList from './components/Order/MyOrderList';
import Profile from './components/Profile/Profile';
import NotificationList from './components/Notification/NotificationList';
import SearchProductList from './components/Product/SearchProductList/SearchProductList';
import VerificationByEmail from './components/Verification/VerificationByEmail';
import SellerProfile from './components/Profile/SellerProfile';
import Chatbox from './components/Chat/Chatbox';
import AboutUs from './components/Pages/AboutUs';
import Feature from './components/Pages/Feature';
import FrequentlyAskedQestions from './components/Pages/FrequentlyAskedQestions';
import TermsCondition from './components/Pages/TermsCondition';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import ContactUs from './components/Pages/ContactUs';
import Checkout from './components/Checkout/Checkout'
import Dashboard from './components/Dashboard/Dashboard'
import SoldProductInvoice from './components/Product/SoldProductList/SoldProductInvoice';
import { Helmet } from 'react-helmet';
import PaymentStatus from './components/Common/PaymentStatus';
import AddEditSupportTicket from './components/SupportTicket/AddEditSupportTicket';
import TicketDetailPage from './components/SupportTicket/TicketDetailPage';
import SupportTicketList from './components/SupportTicket/SupportTicketList';


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const AuthLayout = React.lazy(() => import('./layout/AuthLayout'));


const RESOURCE_URL = appSettings.chat_module_url;
const socket = io(RESOURCE_URL, {
  transports: ['websocket', 'polling'] // use WebSocket first, if available
 });


function App() {
  const storedValueInLocalStorage = { ...localStorage };
  
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("connect", () => { console.log(`I am connected ${socket.connected} with this ${socket.id}`) });
    socket.on('disconnect', (dta) => { console.log(`I am gone ${dta}`) });
    return () => { socket.off('connect'); socket.off('disconnect'); };
  }, []);


  /** Only Load Time Set State From LocalStorage */
  useEffect(() => {
   
    let cart = storedValueInLocalStorage.cart !== undefined ? JSON.parse(storedValueInLocalStorage.cart) : {};
    let categories = storedValueInLocalStorage.categories !== undefined ? JSON.parse(storedValueInLocalStorage.categories) : [];
    let raiseNotificationBell = storedValueInLocalStorage.raiseNotificationBell != undefined ? storedValueInLocalStorage.raiseNotificationBell == "true" ? true : false : false;
    
    if (storedValueInLocalStorage.token !== undefined && storedValueInLocalStorage.token !== null) {
      dispatch(callCommonAction({ isLoggedIn: true, token: storedValueInLocalStorage.token, user: JSON.parse(storedValueInLocalStorage.user), cart: cart, categories: categories }));
    }
    //without user logged in we also need cartegories and raise Notification Bell
    dispatch(callCommonAction({ categories: categories }));
    dispatch(callCommonAction({ raiseNotificationBell: raiseNotificationBell }));
  }, []);

  return (
    <div className="App">
            <SocketContext.Provider value={socket}>

              <ToastContainer autoClose={1500} />

              <BrowserRouter>

                <Suspense>

                  <Routes>

                    <Route exact path="/auth" element={<AuthLayout />} >
                      <Route index element={<Dashboard />} />
                      <Route path={appRoutes.productFormRoute + '/:prod_id?'} element={<AddEditProduct />} />
                      <Route path={appRoutes.productListRoute} element={<ProductList />} />
                      <Route path={appRoutes.dashboardRoute} element={<Dashboard />} />
                      <Route path={appRoutes.soldProductRoute} element={<SoldProduct />} />
                      <Route path={appRoutes.paymentStatusRoute + '/:res?'} element={<PaymentStatus />} />
                      <Route path={appRoutes.myOrdersRoute} element={<MyOrderList />} />
                      <Route path={appRoutes.profileRoute + '/:response?'} element={<Profile />} />
                      <Route exact path={appRoutes.soldProductInvoiceRoute + "/:uuid"} element={<SoldProductInvoice />} />
                      <Route exact path={appRoutes.chatRoute + "/:chat_id?"} element={<Chatbox />} />
                      <Route path={appRoutes.notificationRoute} element={<NotificationList />} />
                      <Route path={appRoutes.addEditSupportTicket} element={<AddEditSupportTicket />} />
                      <Route path={appRoutes.ticketDetailPageRoute + '/:unique_ticket?'} element={<TicketDetailPage />} />
                      <Route path={appRoutes.helpCenterRoute} element={<SupportTicketList />} />
                    </Route>

                    <Route exact path="/" element={<DefaultLayout />} >
                      <Route index element={<Home />} />
                      <Route exact path={appRoutes.loginRoute} element={<Login />} />
                      <Route exact path={appRoutes.productSearchListRoute} element={<SearchProductList />} />
                      <Route exact path={appRoutes.sellerProfileRoute + "/:seller_id"} element={<SellerProfile />} />
                      <Route exact path={appRoutes.verifyEmailRoute + "/:verificationCode"} element={<VerificationByEmail />} />
                      <Route exact path={appRoutes.productDetailRoute + "/:slug"} element={<ProductDetail />} />
                      <Route exact path={appRoutes.resetPasswordRoute + "/:resetToken"} element={<ResetPassword />} />
                      <Route exact path={appRoutes.forgotPasswordRoute} element={<ForgotPassword />} />
                      <Route exact path={appRoutes.registerRoute} element={<Register />} />
                      <Route exact path={appRoutes.aboutUsRoute} element={<AboutUs />} />
                      <Route exact path={appRoutes.featureRoute} element={<Feature />} />
                      <Route exact path={appRoutes.faqRoute} element={<FrequentlyAskedQestions />} />
                      <Route exact path={appRoutes.termsConditionRoute} element={<TermsCondition />} />
                      <Route exact path={appRoutes.privacyPolicyRoute} element={<PrivacyPolicy />} />
                      <Route exact path={appRoutes.contactUsRoute} element={<ContactUs />} />
                      <Route path={appRoutes.checkoutRoute + "/:slug"} element={<Checkout />} />
                    </Route>

                    <Route path='*' element={<NoRouteFound />} />

                  </Routes>

                </Suspense>

              </BrowserRouter>

            </SocketContext.Provider>
    </div>
  );
}

export default App;
