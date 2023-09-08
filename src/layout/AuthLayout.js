import React, { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppSidebar, AppHeader, AppFooter } from '../components/index'
import { AppRoutes } from '../configs'
import PageLoader from '../components/Common/PageLoader'

const AuthLayout = () => {
  const { isLoggedIn, loading, pageLoading } = useSelector((state) => state.common);
  const navigate = useNavigate()
  // const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(AppRoutes.loginRoute);
    }
    
  }, []);
  return (
    <>
      <div className="backend" >
        <div className="row">
          <AppHeader />
          <AppSidebar />
          <Outlet />
          {/* {location.pathname.includes("auth/chat") || location.pathname.includes("auth/order-invoice") ? '' :    <AppFooter /> } */}
        </div>
      </div>
    </>
  )
}

export default AuthLayout
