import React, {useEffect} from 'react'
import { AppRoutes } from '../configs'
import { Outlet,useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
export default function NoRouteFound() {
    const navigate = useNavigate()
    const { isLoggedIn } = useSelector((state) => state.common);
    useEffect(() => {
        if (isLoggedIn) {
            navigate(AppRoutes.authPrfixRoute + '/' + AppRoutes.dashboardRoute);
        }else{
            navigate(AppRoutes.loginRoute);
        }
    }, []);

    return null
}
