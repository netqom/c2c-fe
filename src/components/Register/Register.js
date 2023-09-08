import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sendRequest } from '../../apis/APIs';
import { callCommonAction } from '../../redux/Common/CommonReducer'
import { useNavigate } from 'react-router-dom'
import appRoutes from '../../configs/AppRoutes';
import { validateRegisterFormData } from './Validation';
import { Helmet } from 'react-helmet';
import AutoComplete from '../AutoComplete'

export default function Register() {
	const navigate = useNavigate();
	const [userDetail, setUserDetail] = useState({ terms: false, privacy: false, address: 'Reetsesteenweg 17, 2630 Aartselaar, Belgium', phone: '', role: 2, name: '', email: '', password: '', password_confirmation: '', zipcode: '', lat: '', lng: '', country: '', state: '', city: '' });
	const [errorsInfo, setErrorsInfo] = useState({ terms: false, privacy: false, address: '', phone: '', name: '', email: '',password:'',password_confirmation:''});
	const { loading } = useSelector((state) => state.common);
	const dispatch = useDispatch();
	const [passwordType, setPasswordType] = useState("password");

	/** OnChange Update Input Values */
	const handleChange = (e) => {
		userDetail[e.target.name] = e.target.value;
		setUserDetail(userDetail);
		checkFormIsValid(e.target.name);		
	}
	const handleTermsChange = (e) => {
	  userDetail['terms'] = e.target.checked;
	   setUserDetail(userDetail);	  
	   checkFormIsValid(''); 
	}
	const handlePrivacyChange = (e) => {
		userDetail['privacy'] = e.target.checked;
		 setUserDetail(userDetail);	  
		 checkFormIsValid(''); 
	}

	const handleAutocomplete = (place) => {
		let cntry = '';
		let stat = '';
		let postal_code = '';
		let postal_town = '';
		let fullAddress = '';
		for (const component of place.address_components) {
			const componentType = component.types[0];
			switch (componentType) {
				case "country":
					cntry = component.long_name;
					break;
				case "administrative_area_level_1":
					stat = component.long_name;
					break;
				case "postal_code":
					postal_code = component.long_name;
					break;
				case "postal_town":
					postal_town = component.long_name;
					break;
				default:
					fullAddress = place.name + ', ' + postal_town + ', ' + cntry;
					break;
			}
		}
		fullAddress = place.name + ', ' + postal_town + ', ' + cntry;
		console.log(fullAddress,'fullAddress');
		
		// setUserDetail({ ...userDetail, address: fullAddress, zipcode: postal_code, lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), country: cntry, state: stat, city: postal_town });
        userDetail['address'] = fullAddress; 
		userDetail['zipcode'] = postal_code;
		userDetail['lat'] = place.geometry.location.lat();
		userDetail['lng'] = place.geometry.location.lng();
		userDetail['country'] = cntry;
		userDetail['state'] = stat;
		userDetail['city'] = postal_town;  
		setUserDetail({...userDetail});
        

		console.log(userDetail,'userDetail after address update');
	   if(fullAddress){
		checkFormIsValid('address');
	   }
	}

	/** Password show hide function */
	const togglePassword = () => {
		if (passwordType === "password")
			return setPasswordType("text")
		setPasswordType("password")
	}


	/** Validation implemented here */
	const checkFormIsValid = async (fieldName) => {
		const res = validateRegisterFormData(userDetail, fieldName)
		if(fieldName){
			fieldName = fieldName.trim();
            let err=res.errors[fieldName];
			if(typeof err!='undefined'){
			 errorsInfo[fieldName] = err;	
			}else{
				errorsInfo[fieldName] = '';
			}
			setErrorsInfo({...errorsInfo});
		}else{
			setErrorsInfo({...res.errors});
		}
		return res.formVaildCheck;
	}
    /** Form Submit Functionality Here */
	const registerUser = async (e) => {
		e.preventDefault();
		if (await checkFormIsValid('')) {
			try {
				dispatch(callCommonAction({ loading: true }));
				const res = await sendRequest(`/register`, 'POST', userDetail);
				dispatch(callCommonAction({ loading: false }));
				if (res.data.status) {
					navigate(appRoutes.loginRoute)
				}
			} catch (error) {
				console.log(error);
				dispatch(callCommonAction({ loading: false }));
			}
		}
	}

	return (
		<div>
			<Helmet>
				<title>Alium | Registeration Page</title>
				<meta name="description" content="Registeration Page Description Goes Here" />
				<meta name="keywords" content="Game, Entertainment, Movies" />
			</Helmet>
			<section className="inner-page">
				<div className="container">
					<div className="form-wrap">
						<div className="col-12 form-group">
							<h2 className="h4 text-white mb-4">Register your account</h2>
						</div>
						<div className="form-content">
							<form className="form" noValidate onSubmit={registerUser}>
								<div className="form-group">
									<label>Name</label>
									<input className="form-control" type="text" id="name" name="name" onChange={handleChange} defaultValue={userDetail.name} placeholder="Enter name here" />
									<span className='invalid-field'>{errorsInfo.name}</span>
								</div>
								<div className="form-group">
									<label>Email</label>
									<input type="email" className="form-control" name="email" id="email" onChange={handleChange} defaultValue={userDetail.email} placeholder="Enter email here" />
									<span className='invalid-field'>{errorsInfo.email}</span>
								</div>
								<div className="form-group">
									<label>Phone Number</label>
									<input placeholder="+44 2367436743" className="form-control" type="text" id="phone" name="phone" onChange={handleChange} defaultValue={userDetail.phone} />
									<span className='invalid-field'>{errorsInfo.phone}</span>
								</div>
								{/* <div className="form-group modified-select">
									<label>State</label>
									<Select className="" name="state_id" value={selectedStateOption} isSearchable onChange={(e) => handleChange(e)} options={stateList} />
									<span className='invalid-field'>{errorsInfo.state_id}</span>
								</div> */}

								{/* <div className="form-group modified-select">
									<label>City</label>
									<Select className="" isLoading={loading} name="city_id" value={selectedCityOption} isSearchable onChange={(e) => onChangeCity(e)} options={cityList} />
									{/* <span className='invalid-field'>{errorsInfo.city_id}</span> */}
								{/* </div> */}
								<AutoComplete handleAutocomplete={handleAutocomplete} errorsInfo={errorsInfo} page={'register'} address={''} />
								<div className="form-group">
									<label>Password</label>
									<div className="position-relative" >
										<input type={passwordType} className="form-control" name="password" onChange={handleChange} defaultValue={userDetail.password} id="password" placeholder="Enter password here" />
										<div className="filed-icon">
											<a href={undefined} onClick={togglePassword} >{passwordType === "password" ? <i className="fa fa-eye-slash" ></i> : <i className="fa fa-eye"></i>}</a>
										</div>
									</div>
									<span className='invalid-field'>{errorsInfo.password}</span>
								</div>
								<div className="form-group">
									<label>Confirm Password </label>
									<input className="form-control" onChange={handleChange} defaultValue={userDetail.password_confirmation} name="password_confirmation" type="password" id="password_confirmation" placeholder="Enter confirm password here" />
									<span className='invalid-field'>{errorsInfo.password_confirmation}</span>
								</div>
								<div className="form-group">
									<div className="d-flex flex-wrap align-items-center">
										<input type="checkbox" onChange={handleTermsChange} name="term_condition" className="form-control" />
										<label className="m-0" onClick={() => window.open('/' + appRoutes.termsConditionRoute)}>I accept the <span className='anchor h-underline'>Terms and Conditions</span>*</label>
										<span className='invalid-field'>{errorsInfo.terms}</span>
									</div>
								</div>
								<div className="form-group">
									<div className="d-flex flex-wrap align-items-center">
										<input type="checkbox" onChange={handlePrivacyChange} name="privacy_policy" className="form-control" />
										<label className="m-0" onClick={() => window.open('/' + appRoutes.privacyPolicyRoute)}>I accept the <span className='anchor h-underline'>Privacy Policy</span> *</label>
										<span className='invalid-field'>{errorsInfo.privacy}</span>
									</div>
								</div>
								{loading ?
									<button type="button" className="btn btn-primary w-100">Register <span className="spinner-border" role="status"></span></button>
									:
									<button type="submit" className="btn btn-primary w-100">Register</button>
								}
								<div className="form-info-bottom text-center">
									<p className="my-3 text-white">Already have an account? <span className='anchor h-underline' onClick={() => navigate(appRoutes.loginRoute)}>Login</span></p>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
