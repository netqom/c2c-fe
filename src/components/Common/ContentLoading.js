import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export const ContentLoading = () => {
	const { loading } = useSelector((state) => state.common)
	const location = useLocation();
	return (
		// <div className="myspinner" style={{color: 'rgb(65 0 234)', display: 'flex',  flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
		// 	<div className="myspinner-loader" style={{display: 'inline-flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
		// 		<div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status"> </div>
		// 		<span className="mt-4 ml-2">Loading, Please wait...</span>
		// 	</div>
		// </div>

		<div className="myspinner page-loader-container" style={{height: '100%', position: location.pathname.includes("product-search-list") ? 'fixed' : 'absolute', display : loading ? 'flex' : 'none'}}>
            <div id='new-preloader'>
            <div className='triangle'></div>
            <div className='triangle'></div>
            <div className='triangle'></div>
            <div className='triangle'></div>
            <div className='triangle'></div>
            </div>
        </div>
	)
}