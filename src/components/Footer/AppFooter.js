import React from 'react'
import { faFacebookSquare, faInstagramSquare, faTwitterSquare } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom'
import appRoutes from '../../configs/AppRoutes';
const AppFooter = () => {
	const navigate = useNavigate();
	return (
		<footer className="text-center">
			<div className="container">
				<div className="footer-logo">
					<a href={undefined} onClick={() => navigate('/' + appRoutes.homeRoute)}>
						<img src="/assets/images/logo.png" alt="Alium" title="Alium" />
					</a>
				</div>
				<ul className="footer-links">
					<li><a href={undefined} onClick={() => navigate(appRoutes.aboutUsRoute)}>About Us</a></li>					
					<li><a href={undefined} onClick={() => navigate(appRoutes.featureRoute)}>Features</a></li>
					<li><a href={undefined} onClick={() => navigate(appRoutes.faqRoute)}>FAQ</a></li>
					<li><a href={undefined} onClick={() => navigate(appRoutes.contactUsRoute)}>Contact Us</a></li>
					<li><a href={undefined} onClick={() => navigate(appRoutes.termsConditionRoute)}>Terms and Condition</a></li>
					<li><a href={undefined} onClick={() => navigate(appRoutes.privacyPolicyRoute)}>Privacy Policy</a></li>
				</ul>
				<p className="footer-tagline">Trading platform for gamers all over the world</p>
				<ul className="social-links">
					<li><a href={undefined}><FontAwesomeIcon size="2x" icon={faFacebookSquare} /></a></li>
					<li><a href={undefined}><FontAwesomeIcon size="2x" icon={faTwitterSquare} /></a></li>
					<li><a href={undefined}><FontAwesomeIcon size="2x" icon={faInstagramSquare} /></a></li>
				</ul>
				<div className="copyright">
					© Copyright 2023 Alium |  All Rights Reserved
				</div>
			</div>
		</footer>
	)
}
export default AppFooter;
