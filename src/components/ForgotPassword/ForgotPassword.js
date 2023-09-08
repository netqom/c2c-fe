import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import appRoutes from '../../configs/AppRoutes';
import { useNavigate } from 'react-router-dom';
import { validateForgotPasswordFormData } from './Validation';
import { Helmet } from 'react-helmet';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState({ email: '' });
  const loading = useSelector((state) => state.common.loading)
  const dispatch = useDispatch();
  const [errorsInfo, setErrorsInfo] = useState({});

  /** Forgot Password Form OnChange */
  const handleChange = (e) => {
    userDetail[e.target.name] = e.target.value;
    setUserDetail(userDetail);
    checkFormIsValid()
  }

  /** Validation implemented here */
  const checkFormIsValid = () => {
    const res = validateForgotPasswordFormData(userDetail);
    setErrorsInfo(res.errors);
    return res.formVaildCheck;
  }

  /** Forgot Password Form Submit */
  const forgotPasswordUser = async (e) => {
    e.preventDefault();
    if (checkFormIsValid(userDetail)) {
      try {
        dispatch(callCommonAction({ loading: true }));
        const res = await sendRequest(`/submit-forget-password-form`, 'POST', userDetail);
        dispatch(callCommonAction({ loading: false }));
      } catch (error) {
        //console.log('erroor submitForgetPasswordForm ====> ', error);
        dispatch(callCommonAction({ loading: false }));
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Alium | Forgot Password Page</title>
        <meta name="description" content="Profile Page Description Goes Here" />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="inner-page">
        <div className="container">
          <div className="form-wrap">
            <div className="col-12 form-group">
              <h2 className="h4 text-white mb-4">Reset your password</h2>
            </div>
            <div className="form-content login-content">
              <form className="form" noValidate onSubmit={forgotPasswordUser}>
                <div className="col-12 form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" name="email" id="email" onChange={handleChange} defaultValue={userDetail.email} placeholder="Enter your email address" />
                  <span className='invalid-field'>{errorsInfo.email}</span>
                </div>
                {loading ?
                  <button type="button" className="btn btn-primary w-100">Request Reset <span className="spinner-border" role="status"></span></button>
                  :
                  <button type="submit" className="btn btn-primary w-100">Request Reset</button>
                }
              </form>
              <div className="form-info-bottom text-center">
                <p className="my-3 text-white">Remember your password? <span className='anchor h-underline' onClick={() => navigate(appRoutes.loginRoute)} >Login</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
