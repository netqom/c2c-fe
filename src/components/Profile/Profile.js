import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from "react-router-dom";
import { sendRequest } from '../../apis/APIs';
import { faUpload, faRemove, faUserPen, faLock, faEnvelope, faLocationDot, faCheckCircle, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { callCommonAction } from '../../redux/Common/CommonReducer'
import appRoutes from '../../configs/AppRoutes';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { validateProfileBasicInfoFormData, validateChangePasswordFormData } from './Validation';
import { toast } from 'react-toastify';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import { Helmet } from 'react-helmet';
import AutoComplete from '../AutoComplete'
import { ContentLoading } from '../Common/ContentLoading';

const Profile = () => {
    const [userDetail, setUserDetail] = useState({ state_id: 0, city_id: 0, phone: '', role: 2, name: '', email: '', address: '', display_user_image: '', paypal_email: '', is_paypal_email_verified: '', paypal_email_verification_code: null, zipcode: '', lat: '', lng: '', country: '', state: '', city: '', account_number: '' });
    const [changePasswordDetail, setChangePasswordDetail] = useState({ old_password: '', new_password: '', new_password_confirmation: '' });
    const [errorsInfo, setErrorsInfo] = useState({});
    const [connectedAccounts, setConnectedAccounts] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((state) => state.common);
    const [selectedImage, setSelectedImage] = useState(null);
    const { state } = useLocation(); // Use to open accout tab on click of add edit product page div
    const location = useLocation();
    const [defaultActiveKey, setDefaultActiveKey] = useState(state != null ? state.tab : window.location.hash ? window.location.hash.replace('#', '') : 'general_info');
    //const [verificationCode, setVerificationCode] = useState('');
    const searchParams = new URLSearchParams(document.location.search);

    useEffect(() => {
        callGetUserFormData();
        callGetConnectedAccount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    /** Get Connetc Account or update connect account */
    const callGetConnectedAccount = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            if (searchParams.get('response_id')) {
                await sendRequest(`/update-connect-account`, 'POST', { response_id: searchParams.get('response_id') });
                window.history.pushState('', '', 'profile#account_info');
            }
            const res = await sendRequest(`/get-connect-accounts`, 'GET', {});
            if (res.data.status) {
                setConnectedAccounts(res.data.data);
            }
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }


    const callGetUserFormData = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const res = await sendRequest(`/get-user-form-data`, 'POST', { id: user.id });
            let data = res.data.data;
            data['account_number'] = ''
            setUserDetail(data);
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }

    /** OnChange Update Input Values */
    const handleChange = (e, submitFormType) => {
        console.log('e')
        if (submitFormType === 'basic-info-form') {
            userDetail[e.target.name] = e.target.value;
            setUserDetail(userDetail);
            /**Single Single FieldName Validation Check */
            checkFormIsValid(e.target.name)
        } else if (submitFormType === 'change-password-form') {
            changePasswordDetail[e.target.name] = e.target.value;
            setChangePasswordDetail(changePasswordDetail);
            checkPasswordFormIsValid(e.target.name)
        }
    }

    /** Validation For Password Form */
    const checkPasswordFormIsValid = (fieldName) => {
        const res = validateChangePasswordFormData(changePasswordDetail, fieldName);
        setErrorsInfo(res.errors);
        return res.formVaildCheck;
    }

    /** Submit Change Passwor Form */
    const changePasswordFormSubmit = async (e) => {
        e.preventDefault();
        if (checkPasswordFormIsValid('')) {
            try {
                dispatch(callCommonAction({ loading: true }));
                const res = await sendRequest(`/update-password`, 'POST', changePasswordDetail);
                if (res.data.status) {
                    setChangePasswordDetail({ old_password: '', new_password: '', new_password_confirmation: '' });
                }
                dispatch(callCommonAction({ loading: false }));
            } catch (error) {
                CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
            }
        }
    }

    /** Validation implemented here */
    const checkFormIsValid = (fieldName) => {
        const res = validateProfileBasicInfoFormData(userDetail, fieldName)
        setErrorsInfo(res.errors);
        return res.formVaildCheck;
    }

    /** Form Submit Functionality Here */
    const updateProfile = async (e) => {
        e.preventDefault();
        if (checkFormIsValid('')) {
            try {
                dispatch(callCommonAction({ loading: true }));
                const { name, email, phone, address, role, country, state, city, lat, lng, zipcode } = userDetail;
                const formData = new FormData();
                formData.append('image', selectedImage);
                formData.append('name', name);
                formData.append('item_id', user.id);
                formData.append('role', role);
                formData.append('email', email);
                formData.append('phone', phone);
                formData.append('address', address);
                formData.append('country', country);
                formData.append('state', state);
                formData.append('city', city);
                formData.append('lat', lat);
                formData.append('lng', lng);
                formData.append('zipcode', zipcode);
                const res = await sendRequest(`/add-update-user`, 'POST', formData);
                setSelectedImage(null)
                localStorage.setItem('user', JSON.stringify(res.data.data));
                dispatch(callCommonAction({ loading: false, user: res.data.data }));
            } catch (error) {
                CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
            }
        }
    }

    /** Update Stripe Payment Account Here */
    const updateStripePaymentAccount = async (e) => {
        e.preventDefault();

        // if (checkFormIsValid('')) {

        if (userDetail.account_number != "" && userDetail.account_number != null) {
            try {
                dispatch(callCommonAction({ loading: true }));
                const res = await sendRequest(`/create-connect-account`, 'POST', { account_number: userDetail.account_number });
                if (res.data.status) {
                    const newTab = window.open(res.data.data.url, '_blank');
                    newTab.focus();
                }
                dispatch(callCommonAction({ loading: false }));
            } catch (error) {
                dispatch(callCommonAction({ loading: false }));
                console.log('error', error)
                toast.error(error.message)
            }
        } else {
            toast.error("Please enter account number");
        }
    }

    /** Upodate Payment Account Here */
    // const updatePaymentAccount = async (e) => {
    //     e.preventDefault();
    //     if (checkFormIsValid('')) {
    //         try {
    //             dispatch(callCommonAction({ loading: true }));
    //             const res = await sendRequest(`/add-payment-account`, 'POST', { paypal_email: userDetail.paypal_email, act: 'addUpdate' });
    //             if (res.data.status === true) {
    //                 const userLocalStorage = JSON.parse(localStorage.user);
    //                 userLocalStorage.paypal_email = userDetail.paypal_email

    //                 localStorage.setItem('user', JSON.stringify(userLocalStorage));

    //                 setUserDetail(prevState => ({
    //                     ...prevState,
    //                     paypal_email_verification_code: res.data.data.paypal_email_verification_code, is_paypal_email_verified: res.data.data.is_paypal_email_verified
    //                 }))
    //             }
    //             dispatch(callCommonAction({ loading: false, user: { ...user, paypal_email: userDetail.paypal_email } }));
    //         } catch (error) {
    //             dispatch(callCommonAction({ loading: false }));
    //             toast.error(error.message)
    //         }
    //     }
    // }


    const handleAutocomplete = (place) => {
        let cntry = '';
        let stat = '';
        let postal_code = '';
        let postal_town = '';
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
            }
        }
        let fullAddress = place.name + ', ' + postal_town + ', ' + cntry;

        setUserDetail(prevState => ({
            ...prevState,
            address: fullAddress, zipcode: postal_code, lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), country: cntry, state: stat, city: postal_town
        }))

    }

    // const sendCode = async () => {
    //     try {
    //         const res = await sendRequest(`/add-payment-account`, 'POST', { paypal_email: userDetail.paypal_email, act: 'resendCode' });
    //         setUserDetail(prevState => ({
    //             ...prevState,
    //             paypal_email_verification_code: res.data.data.paypal_email_verification_code, is_paypal_email_verified: res.data.data.is_paypal_email_verified
    //         }))
    //     } catch (error) {
    //         CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
    //     }
    // }

    // const handleVerificationCode = (e) => {
    //     setVerificationCode(e.target.value);
    // }

    // const verifyPaypalEmail = async (e) => {
    //     if (verificationCode != '') {
    //         try {
    //             const res = await sendRequest(`/verify-payment-email`, 'POST', { verificationCode: verificationCode });

    //             setUserDetail(prevState => ({
    //                 ...prevState,
    //                 paypal_email_verification_code: res.data.data.paypal_email_verification_code, is_paypal_email_verified: res.data.data.is_paypal_email_verified
    //             }))

    //         } catch (error) {

    //             CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
    //         }
    //     } else {
    //         toast.error('Enter code!')
    //     }
    // }

    const handleSelect = (tab) => location.hash = '#' + tab;

    const callVerifyApi = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const res = await sendRequest(`/verify-connect-account`, 'GET', {});
            console.log('callVerifyApi', res)
            if (res.status) {
                const newTab = window.open(res.data.data.url, '_blank');
                newTab.focus();
            } else {
                toast.error(res.message)
            }
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            dispatch(callCommonAction({ loading: false }));
            toast.error(error.message)
        }
    }

    const prepareHtmlTableForAccounts = () => {
        let status = connectedAccounts.individual && connectedAccounts.individual.id != undefined ? connectedAccounts.individual.verification.status : 'unverified';
        //let status = 'verified' ;
        return connectedAccounts.external_accounts.data.map((item, index) => {
            return (
                <tr v-for="item in tableItems" key={index}>
                    <td>{index + 1}</td>
                    <td className='text-uppercase'>{item.bank_name}</td>
                    <td className='text-uppercase'>{'#######' + item.last4}</td>
                    <td className='text-uppercase'>{item.currency}</td>
                    <td className='text-uppercase'>{item.country}</td>

                    <td className='text-uppercase'>
                        {
                            status == 'unverified' || status == 'pending'
                                ?
                                <span><a className="text-warning" href={undefined} onClick={() => callVerifyApi()}>Click to verify</a></span>
                                :
                                <span><FontAwesomeIcon icon={faCheckCircle} className='text-success' /> Verified</span>
                        }
                    </td>
                </tr>
            )
        })
    }

    return (
        <div className="content-wrapper">
            <Helmet>
                <title>Alium | My Profile</title>
                <meta name="description" content="Profile Page Description Goes Here" />
                <meta name="keywords" content="Game, Entertainment, Movies" />
            </Helmet>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
                        </li>
                        <li className="breadcrumb-item active">My Profile</li>
                    </ol>
                </div>
                <div className='row'>
                    <div className='col-12 tabs-style'>
                        <Tabs
                            defaultActiveKey={defaultActiveKey}
                            id="uncontrolled-tab-example"
                            onSelect={(e) => handleSelect(e)}
                            className="mb-3">
                            <Tab eventKey="general_info" title="General Info">
                                <div className='card shadow'>
                                    <div className='card-body p-xl-4'>
                                        <div className='row'>
                                            <div className='col-12 d-flex flex-column flex-xl-row'>
                                                <div className='col-xl-3 mb-3 mb-xl-0'>
                                                    <div className="card shadow bg-purple-dark h-100">
                                                        <div className="card-body p-xl-4">
                                                            <div className="card-body text-center">
                                                                <div className='profile-img mb-4'>
                                                                    {
                                                                        selectedImage != null ?
                                                                            (
                                                                                <img alt="not found" height={160} width={160} src={URL.createObjectURL(selectedImage)} />
                                                                            )
                                                                            :
                                                                            user && user.display_user_image
                                                                                ?
                                                                                <img src={user.display_user_image} height={160} width={160} alt='Profile' title='Profile' />
                                                                                :
                                                                                <img src='/assets/images/cr.png' height={160} width={160} alt='Profile' title='Profile' />
                                                                    }
                                                                    
                                                                </div>
                                                                <div className="d-flex justify-content-center mb-4 mt-2">
                                                                    <div className='d-flex align-items-center cstm-upload-btn'>
                                                                        <button type="button" className="btn btn-primary btn-sm"><FontAwesomeIcon icon={faUpload} className="me-1" />Upload</button>
                                                                        <input type="file" name="image" onChange={(event) => setSelectedImage(event.target.files[0])} />
                                                                    </div>
                                                                    {
                                                                        selectedImage != null
                                                                            ?
                                                                            <button type="button" onClick={() => setSelectedImage(null)} className="btn btn-outline-danger ms-1 btn-sm"><FontAwesomeIcon icon={faRemove} className="me-1" />Remove</button>
                                                                            :
                                                                            null
                                                                    }
                                                                </div>
                                                                <h5 className="my-3 text-white text-capitalize">{userDetail.name}</h5>
                                                                <p className="light-purple mb-1"><FontAwesomeIcon icon={faEnvelope} /> {userDetail.email}</p>
                                                                <p className="light-purple mb-4"><FontAwesomeIcon icon={faLocationDot} /> {userDetail.address}</p>
                                                                <span>{Object.keys(userDetail).length !== 0 ? parseFloat(userDetail.avg_rating).toFixed(1) : '0.0'} <FontAwesomeIcon icon={faStar} className='neon-clr' /></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-xl-9 ps-xl-4'>
                                                    <div className="card shadow">
                                                        <div className="card-body p-xl-4">
                                                            <form className="form" noValidate onSubmit={updateProfile}>
                                                                <div className="row g-3">
                                                                    <div className="col-md-12 p-0"><h6 className="m-0 text-primary"><FontAwesomeIcon icon={faUserPen} className='me-2' /> General Information</h6></div>
                                                                    <hr />
                                                                    <div className="col-md-6">
                                                                        <label>Full Name</label>
                                                                        <input type="text" name="name" onChange={(e) => handleChange(e, 'basic-info-form')} className="form-control" value={userDetail.name} placeholder="Enter your first name" onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} />
                                                                        <span className='invalid-field'>{errorsInfo.name}</span>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <label>Email</label>
                                                                        <input type="email" name="email" readOnly onChange={(e) => handleChange(e, 'basic-info-form')} className="form-control" value={userDetail.email} placeholder="Enter your email address" />
                                                                        <span className='invalid-field'>{errorsInfo.email}</span>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <label>Phone Number</label>
                                                                        <input type="text" name="phone" onChange={(e) => handleChange(e, 'basic-info-form')} className="form-control" placeholder="000000" value={userDetail.phone} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} />
                                                                        <span className='invalid-field'>{errorsInfo.phone}</span>
                                                                    </div>
                                                                    <AutoComplete handleAutocomplete={handleAutocomplete} errorsInfo={errorsInfo} page={'profle'} address={userDetail.address} />
                                                                    <div className="d-flex mt-5 mb-3 justify-content-center justify-content-md-end">
                                                                        <button type="submit" className="btn btn-primary m-0 btn-sm">Save changes {loading ? <span className="spinner-border" role="status"></span> : ''}</button>
                                                                    </div>

                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="account_info" title="Account Info">
                                <div className="card shadow">
                                    <div className="card-body p-xl-4">
                                        <div className="row">
                                            <div className="col-12 d-flex flex-column flex-xl-row">
                                                <div className='col-xl-3 mb-3 mb-xl-0'>
                                                    <div className="card shadow bg-purple-dark h-100">
                                                        <div className="card-body p-xl-4">
                                                            <div className="card-body text-center">
                                                                <div className='profile-img mb-4'>
                                                                    {
                                                                        selectedImage != null ?
                                                                            (
                                                                                <img alt="not found" height={160} width={160} src={URL.createObjectURL(selectedImage)} />
                                                                            )
                                                                            :
                                                                            user && user.display_user_image
                                                                                ?
                                                                                <img src={user.display_user_image} height={160} width={160} alt='Profile' title='Profile' />
                                                                                :
                                                                                <img src='/assets/images/cr.png' height={160} width={160} alt='Profile' title='Profile' />
                                                                    }
                                                                </div>
                                                                <h5 className="my-3 text-white text-capitalize">{userDetail.name}</h5>
                                                                <p className="light-purple mb-1"><FontAwesomeIcon icon={faEnvelope} /> {userDetail.email}</p>
                                                                <p className="light-purple mb-4"><FontAwesomeIcon icon={faLocationDot} /> {userDetail.address}</p>
                                                                <span>{Object.keys(userDetail).length !== 0 ? parseFloat(userDetail.avg_rating).toFixed(1) : '0.0'} <FontAwesomeIcon icon={faStar} className='neon-clr' /></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div className='col-xl-9 ps-xl-4'>
                                                    <div className="card shadow">
                                                        <div className="card-body p-xl-4">
                                                            <div className="row g-3">
                                                                <div className="col-md-12 p-0 d-flx"><h6 className="m-0 text-primary"><FontAwesomeIcon icon={faLock} className='me-2' /> Add Paypal Account Info</h6></div>
                                                                <hr />
                                                                <form className="form" noValidate onSubmit={updatePaymentAccount}>
                                                                    <div className="col-md-6">
                                                                        <label>Paypal email address</label>
                                                                        <div className='d-flex'>
                                                                        <input type="text" onChange={(e) => handleChange(e, 'basic-info-form')} className="form-control" name="paypal_email" value={userDetail.paypal_email} placeholder='Please enter paypal email here' />
                                                                        { userDetail.is_paypal_email_verified===1 ? 
                                                                        <img className='ms-3 w-30' src='/assets/images/green-tick.svg' alt='' title='' />
                                                                        :''
                                                                        }
                                                                        </div>
                                                                        
                                                                        
                                                                        <span className='invalid-field'>{errorsInfo.paypal_email}</span>
                                                                        { userDetail.is_paypal_email_verified!=1 && userDetail.paypal_email_verification_code!=null && userDetail.paypal_email!='' ?
                                                                        <small>We have sent you a code please check your email.<a href="javascript:;" onClick={() => sendCode()} > Click here to resend code.</a></small>:'' }
                                                                    </div>
                                                                    { userDetail.is_paypal_email_verified!=1 && userDetail.paypal_email_verification_code!=null && userDetail.paypal_email!='' ?
                                                                    <div className="col-md-6">
                                                                        <label></label>
                                                                        <input type="text" className="form-control" name="verification_code"  placeholder='Please enter code here' onChange={(e) => handleVerificationCode(e)} />
                                                                        <span className='invalid-field'>{errorsInfo.paypal_email_verification_code}</span>
                                                                   </div>  :''}
                                                                    <div className="col-md-6 mt-2">
                                                                        <button type="submit" className="btn btn-primary me-2 btn-sm">Save {loading ? <span className="spinner-border" role="status"></span> : ''}</button>
                                                                        
                                                                        { userDetail.is_paypal_email_verified!=1 && userDetail.paypal_email_verification_code!=null && userDetail.paypal_email!='' ?
                                                                        <a href="javascript:;" className="btn btn-primary m-0 btn-sm" onClick={() => verifyPaypalEmail()} >Verify </a>
                                                                        :''}
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> */}


                                                <div className='col-xl-9 ps-xl-4'>
                                                    {/* <div className="card shadow">
                                                        <div className="card-body p-xl-4">
                                                            <div className="row g-3">
                                                                <div className="col-md-12 p-0 d-flx"><h6 className="m-0 text-primary"><FontAwesomeIcon icon={faLock} className='me-2' /> Add Stripe Account Info</h6></div>
                                                                <hr />

                                                            </div>
                                                        </div>
                                                    </div> */}
                                                    <div className="card shadow">
                                                        <div className="card-body">
                                                            <div className="col-md-12 p-0 d-flx">
                                                                <div className='d-flex flex-column flex-md-row align-items-center'>
                                                                    <h6 className="m-0 text-primary"><FontAwesomeIcon icon={faLock} className='me-2' /> Add Stripe Account Info</h6>

                                                                </div>
                                                            </div>
                                                            <hr />
                                                            <form className="form ms-0 ms-md-auto mt-3 mt-md-0 mb-4" onSubmit={updateStripePaymentAccount}>
                                                                <div className="col-md-12">
                                                                    <label>Account Number</label>
                                                                    <div className="row flex-column flex-md-row">
                                                                        <div className="col-12 col-md-7 mb-2 mb-md-0"><input type="text" onChange={(e) => handleChange(e, 'basic-info-form')} className="form-control" name="account_number" value={userDetail.account_number} placeholder='Please enter account number here' /></div>
                                                                        <div className="col-12 col-md-5"><button type="submit" className="btn btn-primary me-2 py-2">Add new account {loading ? <span className="spinner-border" role="status"></span> : ''}</button></div>
                                                                    </div>
                                                                    <span className='invalid-field'>{errorsInfo.account_number}</span>
                                                                </div>


                                                            </form>
                                                            <ContentLoading />
                                                            <div className="table-responsive">
                                                                <table className="table table-bordered" width="100%" cellSpacing="0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th width="30">Sr.No.</th>
                                                                            <th>Bank Name</th>
                                                                            <th>Last4</th>
                                                                            <th>Currency</th>
                                                                            <th>Country</th>
                                                                            <th>Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {connectedAccounts.hasOwnProperty('id') && connectedAccounts.external_accounts.data.length > 0 ? <>{prepareHtmlTableForAccounts()}</> : <><tr className="text-center"><td colSpan="5">You have not set any account yet.</td></tr></>}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="password" title="Password" >
                                <div className="card shadow">
                                    <div className="card-body p-xl-4">
                                        <div className="row">
                                            <div className="col-12 d-flex flex-column flex-xl-row">
                                                <div className='col-xl-3 mb-3 mb-xl-0'>
                                                    <div className="card shadow bg-purple-dark h-100">
                                                        <div className="card-body p-xl-4">
                                                            <div className="card-body text-center">
                                                                <div className='profile-img mb-4'>
                                                                    {
                                                                        selectedImage != null ?
                                                                            (
                                                                                <img alt="not found" height={160} width={160} src={URL.createObjectURL(selectedImage)} />
                                                                            )
                                                                            :
                                                                            user && user.display_user_image
                                                                                ?
                                                                                <img src={user.display_user_image} height={160} width={160} alt='Profile' title='Profile' />
                                                                                :
                                                                                <img src='/assets/images/cr.png' height={160} width={160} alt='Profile' title='Profile' />
                                                                    }
                                                                </div>
                                                                <h5 className="my-3 text-white text-capitalize">{userDetail.name}</h5>
                                                                <p className="light-purple mb-1"><FontAwesomeIcon icon={faEnvelope} /> {userDetail.email}</p>
                                                                <p className="light-purple mb-4"><FontAwesomeIcon icon={faLocationDot} /> {userDetail.address}</p>
                                                                <span>{Object.keys(userDetail).length !== 0 ? parseFloat(userDetail.avg_rating).toFixed(1) : '0.0'} <FontAwesomeIcon icon={faStar} className='neon-clr' /></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-xl-9 ps-xl-4'>
                                                    <div className="card shadow">
                                                        <div className="card-body p-xl-4">
                                                            <form className="form" onSubmit={changePasswordFormSubmit}>
                                                                <div className="row g-3">
                                                                    <div className="col-md-12 p-0"><h6 className="m-0 text-primary"><FontAwesomeIcon icon={faLock} className='me-2' /> Change Password</h6></div>
                                                                    <hr />
                                                                    <div className="col-md-6">
                                                                        <div className='row'>
                                                                            <div className="col-md-12 mb-3">
                                                                                <label>Current Password</label>
                                                                                <input type="password" name="old_password" onChange={(e) => handleChange(e, 'change-password-form')} value={changePasswordDetail.old_password} className="form-control" placeholder="Enter your current password" />
                                                                                <span className='invalid-field'>{errorsInfo.old_password}</span>
                                                                            </div>
                                                                            <div className="col-md-12 mb-3">
                                                                                <label>New Password</label>
                                                                                <input type="password" name="new_password" onChange={(e) => handleChange(e, 'change-password-form')} value={changePasswordDetail.new_password} className="form-control" placeholder="Enter your new password" />
                                                                                <span className='invalid-field'>{errorsInfo.new_password}</span>
                                                                            </div>
                                                                            <div className="col-md-12 mb-3">
                                                                                <label>Confirm New Password</label>
                                                                                <input type="password" name="new_password_confirmation" onChange={(e) => handleChange(e, 'change-password-form')} value={changePasswordDetail.new_password_confirmation} className="form-control" placeholder="Confirm new password" />
                                                                                <span className='invalid-field'>{errorsInfo.new_password_confirmation}</span>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex  mb-3">
                                                                        <button type="submit" className="btn btn-primary m-0 btn-sm">Save changes</button>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default Profile