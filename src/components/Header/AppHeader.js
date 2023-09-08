import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation, json } from 'react-router-dom'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import appRoutes from '../../configs/AppRoutes';
import { sendRequest } from '../../apis/APIs';
import { faAngleDown, faBars, faBell, faCircle, faClose, faDashboard, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import SocketContext from '../../apis/socket-context';

const AppHeader = () => {

   const [stickyHeader, setStickyHeader] = useState('');
   const { isLoggedIn, user, raiseNotificationBell } = useSelector((state) => state.common);
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const socket = useContext(SocketContext);
   const location = useLocation();
   const [draftProduct, setDraftProduct] = useState(null);

   useEffect(() => {
      /** Raise Notification */
      socket.on("raise_notification_bell", (usersArray) => {
         if (usersArray.includes(parseInt(user.id))) {
            dispatch(callCommonAction({ raiseNotificationBell: true }))
         }
      })
      window.addEventListener("scroll", () => {
         setStickyHeader(window.scrollY > 50 ? 'sticky' : '');
      });

      if (isLoggedIn) {
         getDraftProduct();
      }


      //Implementing the setInterval method
      const interval = setInterval(() => {
         if (isLoggedIn) {
            checkUnreadNotification();
         }
      }, 60000 * 5);

      //Clearing the interval
      return () => clearInterval(interval);

   }, []);


   const getDraftProduct = async () => {
      try {
         const res = await sendRequest(`/get-draft-product`, 'POST', {});
         setDraftProduct(res.data.data)
      } catch (error) {
      }
   }

   const checkUnreadNotification = async () => {
      try {
         const res = await sendRequest(`/count-unread-notifications`, 'POST', {});
         const unreadNotification = res.data.data === 0 ? false : true
         localStorage.setItem('raiseNotificationBell', unreadNotification)
         dispatch(callCommonAction({ loading: false, raiseNotificationBell: unreadNotification }));
      } catch (error) {
      }
   }

   const logoutHandler = async () => {
      try {
         dispatch(callCommonAction({ loading: true }));
         const res = await sendRequest(`/logout`, 'POST');
         dispatch(callCommonAction({ loading: false }));
         if (res.data.status) {
            localStorage.removeItem("token");
            localStorage.removeItem('user');
            localStorage.removeItem('raiseNotificationBell');
            dispatch(callCommonAction({ raiseNotificationBell:false, isLoggedIn: false, token: null, user: null }));
            navigate(appRoutes.loginRoute);
         }
      } catch (error) {
         CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
      }
   }

   return (
      <header className={`fixed-top py-md-2 ${stickyHeader}`}>
         <Container>
            <div className="row">
               <div className="col menus">
                  <Navbar collapseOnSelect expand="lg" className='py-md-0'>
                     <Navbar.Brand href={undefined} onClick={() => navigate('/' + appRoutes.homeRoute)}>
                        <img src="/assets/images/logo.png" alt="Alium" title="Alium"></img>
                     </Navbar.Brand>
                     <Navbar.Toggle data-toggle="collapse" data-bs-target="#basic-navbar-nav" aria-controls="basic-navbar-nav">
                        <FontAwesomeIcon icon={faBars} className="text-white" />
                     </Navbar.Toggle>
                     <Navbar.Collapse id="basic-navbar-nav">
                        <Navbar.Toggle data-toggle="collapse" data-bs-target="#basic-navbar-nav" aria-controls="basic-navbar-nav">
                           <FontAwesomeIcon icon={faClose} className="text-white" />
                        </Navbar.Toggle>
                        <Nav className="ms-auto gap-2">
                           <Nav.Link href={undefined} className='position-relative'>

                              <FontAwesomeIcon icon={faBell} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.notificationRoute)} />

                              {raiseNotificationBell ? <FontAwesomeIcon icon={faCircle} className='noti-dot text-success' /> : null}

                           </Nav.Link>
                           {
                              !location.pathname.includes("/auth/")
                                 ?
                                 <Nav.Link href={undefined} className='gold-btn' onClick={() => user == null ? navigate(appRoutes.loginRoute) : draftProduct && draftProduct.hasOwnProperty('id') ? navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productFormRoute + '/' + draftProduct.id) : navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productFormRoute)}><img src="/assets/images/lock.png" alt="Sell Item" title="Sell Item" />
                                    Sell Item
                                 </Nav.Link>
                                 :
                                 ''
                           }


                           {
                              isLoggedIn
                                 ?
                                 <div className='account-dropdown'>
                                    <DropdownButton className='bg-transparent p-0 align-items-start flex-column flex-md-row'
                                       as={ButtonGroup}
                                       id={`dropdown-button-drop-${'down-centered'}`}
                                       drop={'down-centered'}
                                       variant="secondary"
                                       title={<>
                                          {
                                             user && user.display_user_image
                                                ?
                                                <img className='avatar me-2' src={user.display_user_image} alt='' title='' />
                                                :
                                                <img className='avatar me-2' src="/assets/images/cr.png" alt='' title='' />
                                          }
                                          <FontAwesomeIcon icon={faAngleDown} ></FontAwesomeIcon> </>}
                                    >
                                       <Dropdown.Item className='text-capitalize text-truncate' onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.profileRoute)} eventKey="1">
                                          {
                                             user && user.display_user_image
                                                ?
                                                <img className='avatar me-2' src={user.display_user_image} alt='' title='' />
                                                :
                                                <img className='avatar me-2' src="/assets/images/cr.png" alt='' title='' />
                                          }
                                          {user.name}
                                       </Dropdown.Item>
                                       <Dropdown.Divider />
                                       <Dropdown.Item eventKey="2" className='my-2' onClick={() => navigate(appRoutes.authPrfixRoute + appRoutes.dashboardRoute)}><FontAwesomeIcon icon={faDashboard} className='opacity-50 me-2' /> Dashboard</Dropdown.Item>
                                       <Dropdown.Item eventKey="3" className='my-2' onClick={() => logoutHandler()} ><FontAwesomeIcon icon={faLock} className='opacity-50 me-2' /> Logout</Dropdown.Item>

                                    </DropdownButton>
                                 </div>
                                 :
                                 <Nav.Link className="nav-link" href={undefined} onClick={() => navigate(appRoutes.loginRoute)}><img src="/assets/images/login.png" alt="Login" title="Login" /> Login</Nav.Link>
                           }
                        </Nav>
                     </Navbar.Collapse>
                  </Navbar>
               </div>
            </div>
         </Container>
      </header>
   )
}
export default AppHeader;
