import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from "react-router-dom";
import { callCommonAction } from '../../redux/Common/CommonReducer'
import { sendRequest } from '../../apis/APIs';
import Helper from '../../apis/Helper';
import STRINGS from '../../common/strings/strings';
import appRoutes from '../../configs/AppRoutes';
import { validateResetPasswordFormData } from './Validation';
import { Helmet } from 'react-helmet';

export default function ResetPassword(props) {
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState({ password: '', password_confirmation: '', resetToken: '' });
  const { loading } = useSelector((state) => state.common)
  const dispatch = useDispatch();
  const [errorsInfo, setErrorsInfo] = useState({});
  const { resetToken } = useParams();

  useEffect(() => {
    setUserDetail({ ...userDetail, resetToken: resetToken });
  }, []);

  /** Reset Password Form OnChange */
  const handleChange = (e) => {
    userDetail[e.target.name] = e.target.value;
    setUserDetail(userDetail);
    checkFormIsValid(e.target.name)
  }
  /** Validation implemented here */
  const checkFormIsValid = (fieldName) => {
    const res = validateResetPasswordFormData(userDetail, fieldName);
    setErrorsInfo(res.errors);
    return res.formVaildCheck;
  }

  /** Reset Password Form Submit */
  const resetPassword = async (e) => {
    e.preventDefault();
    if (checkFormIsValid('')) {
      try {
        dispatch(callCommonAction({ loading: true }));
        await sendRequest(`/submit-reset-password-form`, 'POST', userDetail);
        dispatch(callCommonAction({ loading: false }));
        navigate(appRoutes.loginRoute);
      } catch (error) {
        console.log('erroor submitForgetPasswordForm ====> ', error);
        dispatch(loading({ loading: false }));
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Alium | Reset Password Page</title>
        <meta name="description" content="Reset Password Page Description Goes Here" />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="inner-page">
        <div className="container">
          <div className="form-wrap">
            <div className="col-12 form-group">
              <h2 className="h4 text-white mb-4">Reset your password</h2>
            </div>
            <div className="form-content login-content">
              <form className="form" noValidate onSubmit={resetPassword}>
                <div className="col-12 form-group">
                  <label>Password </label>
                  <input className="form-control" name="password" onChange={handleChange} defaultValue={userDetail.password} type="password" id="password" placeholder="Password" />
                  <span className='invalid-field'>{errorsInfo.password}</span>
                </div>
                <div className="col-12 form-group">
                  <label>Confirm Password </label>
                  <input className="form-control" onChange={handleChange} defaultValue={userDetail.password_confirmation} name="password_confirmation" type="password" id="password_confirmation" placeholder="Confirm Password" />
                  <span className='invalid-field'>{errorsInfo.password_confirmation}</span>
                </div>
                {loading ?
                  <button type="button" className="btn btn-primary w-100">Submit <span className="spinner-border" role="status"></span></button>
                  :
                  <button type="submit" className="btn btn-primary w-100">Submit</button>
                }
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
