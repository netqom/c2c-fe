import React, { useState, useEffect } from 'react'
import { faEnvelope, faLocation, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux';
import STRINGS from '../../common/strings/strings';
import Helper from '../../apis/Helper';
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import AppConfig from '../../configs/AppConfig';
import { Helmet } from 'react-helmet';

const ContactUs = () => {
  const [userDetail, setUserDetail] = useState({ email: '', first_name: '', last_name: '', message: '', phone: '' });
  const [contactUsDetail, setContactUsDetail] = useState({});
  const [errorsInfo, setErrorsInfo] = useState({});
  const { loading } = useSelector((state) => state.common);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0)
    getContactUsData();
  }, [])

  /** Get Conatact Page Data */
  const getContactUsData = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const res = await sendRequest(`/contact-us`, 'GET');
      setContactUsDetail(res.data.data);
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  /** Handle Change Getting The Values Here */
  const handleChange = (e) => {
    userDetail[e.target.name] = e.target.value;
    setUserDetail(userDetail);
    checkFormIsValid(e.target.name)
  }

  /** Validation implemented here */
  const checkFormIsValid = async (fieldName) => {
    const res = validateContactFormData(userDetail, fieldName)
    // setErrorsInfo(res.errors);
    return res.formVaildCheck;
  }

  const submitForm = async (e) => {
    e.preventDefault();
    if (await checkFormIsValid('')) {
      try {
        dispatch(callCommonAction({ loading: true }));
        const res = await sendRequest(`/submit-contact-form`, 'POST', userDetail);
        setUserDetail({ ...userDetail, email: '', first_name: '', last_name: '', message: '', phone: '' })
        dispatch(callCommonAction({ loading: false }));
      } catch (error) {
        console.log(error);
        dispatch(callCommonAction({ loading: false }));
      }
    }
  }

  const validateContactFormData = (userDetail, fieldName) => {
    const { first_name, last_name, email, phone, message } = userDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    if (first_name === '' && (fieldName === 'first_name' || fieldName === '')) {
      errorMsg = first_name === '' ? STRINGS.firstNameReq : '';
      errorsInfo['first_name'] = errorMsg;
      formVaildCheck = false;
    }else if(first_name !== '' && fieldName === 'first_name'){ errorsInfo['first_name'] = '';  }
    
    if (last_name === '' && (fieldName === 'last_name' || fieldName === '')) {
      errorMsg = last_name === '' ? STRINGS.lastNameReq : '';
      errorsInfo['last_name'] = errorMsg;
      formVaildCheck = false;
    }else if(last_name !== '' && fieldName === 'last_name'){ errorsInfo['last_name'] = '';  }
    
    if ((fieldName === 'email' || fieldName === '') && (!Helper.validateEmail(email))) {
      errorMsg = email === '' ? STRINGS.emailReq : STRINGS.invalidEmail;
      formVaildCheck = false;
      errorsInfo['email'] = errorMsg;
    }else if( (fieldName === 'email' || fieldName !== '') && (Helper.validateEmail(email)) ){ errorsInfo['email'] = '';  }
    
    if ((fieldName === 'phone' || fieldName === '') && (!phone.match(/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/))) {
      errorMsg = phone === '' ? STRINGS.phoneReq : STRINGS.phoneInvalid;
      errorsInfo['phone'] = errorMsg;
      formVaildCheck = false;
    }else if( (fieldName === 'phone' || fieldName !== '') && (phone.match(/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/)) ){ errorsInfo['phone'] = '';  }
    
    if (message === '' && (fieldName === 'message' || fieldName === '')) {
      errorMsg = message === '' ? STRINGS.messageReq : '';
      errorsInfo['message'] = errorMsg;
      formVaildCheck = false;
    }else if(message !== '' && fieldName === 'message'){ errorsInfo['message'] = '';  }
    
     setErrorsInfo({...errorsInfo});
    
     return { formVaildCheck: formVaildCheck};
  }

  /** Check Length Of Product Detail Arry */
  const contactUsDataLen = (checkKey) => contactUsDetail.hasOwnProperty(checkKey) && contactUsDetail[checkKey].length

  const contactUsContent = (rootKeyOfObj, nextKeyObj) => contactUsDetail[rootKeyOfObj].map((item) => item.param == nextKeyObj ? item.value : null).filter(ele => ele != null);

  return (
    <div>
      <Helmet>
        <title>{`Alium |  ${contactUsDataLen('page_contents') > 0 ? contactUsContent('page_contents', 'meta_title') : 'Conatact Us Page'}`}</title>
        <meta name="description" content={contactUsDataLen('page_contents') > 0 ? contactUsContent('page_contents', 'meta_description') : ''} />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="banner-sec" style={{
        backgroundImage: `url(${contactUsDetail.hasOwnProperty('id') ? AppConfig.admin_backend_url + '/storage/' + contactUsContent('page_contents', 'banner_image') : ''})`
      }}>
        <div className="banner-caption">
          <div className="hero-content">
            <div className="caption d-flex flex-column align-items-center position-relative">
              <div className="border-box"></div>
              <div className="gradient-box"></div>
              <h1>Contact Us</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="inner-content">
        <div className="container">
          <div className="row flex-column flex-md-row">
            <div className="col-lg-4 text-white g-5 mt-5 px-4">
              <div className="card-cstm h-100 p-4">
                <h4 className="mb-3">
                  <span>Get In Touch</span>
                </h4>
                <hr />
                <div className="col mb-4 d-flex">
                  <div className="contact-icon flex-shrink-0">
                    <FontAwesomeIcon
                      className="h5 m-0 light-purple"
                      icon={faLocation}
                    />
                  </div>
                  <div>
                    <strong className="d-block text-uppercase mb-1">
                      Address
                    </strong>
                    <p>{contactUsDataLen('page_contents') > 0 ? contactUsContent('page_contents', 'contact_address') : ''}</p>
                  </div>
                </div>
                <div className="col mb-4 d-flex">
                  <div className="contact-icon flex-shrink-0">
                    <FontAwesomeIcon
                      className="h6 m-0 light-purple"
                      icon={faEnvelope}
                    />
                  </div>
                  <div>
                    <strong className="d-block text-uppercase mb-1">Email</strong>
                    <p className="text-break">{contactUsDataLen('page_contents') > 0 ? contactUsContent('page_contents', 'contact_email') : ''}</p>
                  </div>
                </div>
                <div className="col d-flex">
                  <div className="contact-icon flex-shrink-0">
                    <FontAwesomeIcon
                      className="h6 m-0 light-purple"
                      icon={faPhone}
                    />
                  </div>
                  <div>
                    <strong className="d-block text-uppercase mb-1">Phone</strong>
                    <p>{contactUsDataLen('page_contents') > 0 ? contactUsContent('page_contents', 'contact_phone') : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8  text-white g-5 mt-5 px-4">
              <div className="card-cstm h-100">
                <form className="form contact-form" noValidate onSubmit={submitForm}>
                  <div className="form-content p-4">
                    <h4 className="">
                      <span>Send us a message</span>
                    </h4>
                    <p>{contactUsDataLen('page_contents') > 0 ? contactUsContent('page_contents', 'contact_us_message_subtitle') : ''}</p>
                    <hr />
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label>First name</label>
                        <input type="first_name" className="form-control" name="first_name" id="first_name" onChange={handleChange} value={userDetail.first_name} placeholder="Enter your first name" />
                        <span className='invalid-field'>{errorsInfo.first_name}</span>

                      </div>
                      <div className="col-md-6 form-group">
                        <label>Last name</label>
                        <input type="last_name" className="form-control" name="last_name" id="last_name" onChange={handleChange} value={userDetail.last_name} placeholder="Enter your last name" />
                        <span className='invalid-field'>{errorsInfo.last_name}</span>

                      </div>

                    </div>
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" name="email" id="email" onChange={handleChange} value={userDetail.email} placeholder="Enter your email address" />
                        <span className='invalid-field'>{errorsInfo.email}</span>

                      </div>
                      <div className="col-md-6 form-group">
                        <label>Phone</label>
                        <input className="form-control" type="text" id="phone" name="phone" onChange={handleChange} value={userDetail.phone} placeholder="Enter phone number here" />
                        <span className='invalid-field'>{errorsInfo.phone}</span>

                      </div>
                      <div className="col-md-12 form-group">
                        <label>Message</label>
                        <textarea onChange={handleChange} className="form-control" name="message" cols="60" rows="5" placeholder="Enter your message" value={userDetail.message} />
                        <span className='invalid-field'>{errorsInfo.message}</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12 form-group text-end">
                        {loading ?
                          <button type="button" className="btn btn-primary w-100">Submit <span className="spinner-border" role="status"></span></button>
                          :
                          <button type="submit" className="btn btn-primary w-100">Submit</button>
                        }
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUs;
