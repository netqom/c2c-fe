import React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import appRoutes from '../../configs/AppRoutes';
import { faAngleDown, faBell, faDashboard, faList, faListNumeric, faSuitcase, faUser, faComments, faHelicopter, faQuestion, faBox, faTag, faTags, faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

const AppSidebar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [open, setOpen] = useState(false)

	return (
		<nav className="navbar navbar-expand-lg navbar-dark" id="mainNav">
			<Button className="d-flex justify-content-between navbar-toggler navbar-toggler-right bg-transparent"
				onClick={() => setOpen(!open)}
				aria-controls="navbarResponsive"
				aria-expanded={open}
			>
				Profile Links <FontAwesomeIcon icon={faAngleDown} />
			</Button>
			<Collapse in={open}>
				<div className="collapse navbar-collapse" id="navbarResponsive">
					<ul className="navbar-nav navbar-sidenav" id="exampleAccordion">
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="Dashboard">
							<a className="nav-link" href={undefined} onClick={() => navigate(appRoutes.dashboardRoute)}>
								<FontAwesomeIcon icon={faDashboard} /> <span className="nav-link-text">Dashboard</span>
							</a>
						</li>
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.productListRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="List Products">
							<a className="nav-link" href={undefined} onClick={() => navigate(appRoutes.productListRoute)}>
								<FontAwesomeIcon icon={faUser} /> <span className="nav-link-text">My products</span>
							</a>
						</li>
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.soldProductRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="Sold Products">
							<a className="nav-link px-5 py-1" href={undefined} onClick={() => navigate(appRoutes.soldProductRoute)}>
								<FontAwesomeIcon icon={faTags} /> <span className="nav-link-text">Sold Products</span>
							</a>
						</li>	
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.myOrdersRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="My Orders">
							<a className="nav-link px-5 py-1" href={undefined} onClick={() => navigate(appRoutes.myOrdersRoute)}>
								<FontAwesomeIcon icon={faCube} /> <span className="nav-link-text">My Orders</span>
							</a>
						</li>
						{/* <li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.profileRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="My Profile">
							<a className="nav-link" href={undefined} onClick={() => navigate(appRoutes.profileRoute)}>
								<FontAwesomeIcon icon={faUser} /> <span className="nav-link-text">My Profile</span>
							</a>
						</li>
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.notificationRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="Notifications">
							<a className="nav-link" href={undefined} onClick={() => navigate(appRoutes.notificationRoute)}>
								<FontAwesomeIcon icon={faBell} /> <span className="nav-link-text">Notifications </span>
							</a>
						</li> */}
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.chatRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="Chat">
							<a className="nav-link" href={undefined} onClick={() => navigate(appRoutes.chatRoute)}>
								<FontAwesomeIcon icon={faComments} /> <span className="nav-link-text">Chat </span>
							</a>
						</li>
						<li className={location.pathname === appRoutes.authPrfixRoute + '/' + appRoutes.helpCenterRoute ? 'nav-item active' : 'nav-item'} data-toggle="tooltip" data-placement="right" title="Help Section">
							<a className="nav-link" href={undefined} onClick={() => navigate(appRoutes.helpCenterRoute)}>
								<FontAwesomeIcon icon={faQuestion} /> <span className="nav-link-text">Help Section </span>
							</a>
						</li>
					</ul>
					<ul className="navbar-nav sidenav-toggler">
						<li className="nav-item">
							<a className="nav-link text-center" id="sidenavToggler">
								<i className="fa fa-fw fa-angle-left"></i>
							</a>
						</li>
					</ul>
				</div>
			</Collapse>
		</nav>

	)
}
export default AppSidebar;