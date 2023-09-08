import React, { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppFooter, AppHeader } from '../components/index'
import { AppRoutes } from '../configs'
import PageLoader from '../components/Common/PageLoader'

const DefaultLayout = (props) => {
  const location = useLocation();
  const navigate = useNavigate()
  const { loading, isLoggedIn, pageLoading } = useSelector((state) => state.common);

  useEffect(() => {
    // Redirect If User loggedin and currect route is not belongs to below ones 
    if (isLoggedIn && (!location.pathname.includes("")) && (!location.pathname.includes("check-out/")) && (!location.pathname.includes("/seller-profile/")) && (!location.pathname.includes("/product-detail/")) && (!location.pathname.includes("/product-search-list"))) {
      return navigate(AppRoutes.dashboardRoute);
    }
  }, []);

  return (
    <>
      {loading && pageLoading !== false ? <PageLoader /> : null}
      <div style={{ display: loading && pageLoading ? 'none' : 'block' }}>
        <AppHeader />
        <Outlet />
        <AppFooter />
      </div>
    </>
  )
}

export default DefaultLayout
