import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import appRoutes from '../../configs/AppRoutes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateLoginFormData } from './Validation'
import { Helmet } from 'react-helmet';

export default function Login() {
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState({ email: '', password: '' });
  const [errorsInfo, setErrorsInfo] = useState({});
  const { loading, isLoggedIn } = useSelector((state) => state.common);
  const dispatch = useDispatch();
  const [passwordType, setPasswordType] = useState("password");
  const { state } = useLocation();

  useEffect(() => {
    if (isLoggedIn) {
      if (state != null) {
        navigate(appRoutes.checkoutRoute + '/' + state.slug, { state : { 'last_route' : 'login'} });
        return
      }
      navigate(appRoutes.dashboardRoute);
    }
  }, [isLoggedIn]);

  /** Password show hide function */
  const togglePassword = () => {
    if (passwordType === "password")
      return setPasswordType("text")
    setPasswordType("password")
  }

  const handleChange = (e) => {
    userDetail[e.target.name] = e.target.value;
    setUserDetail(userDetail);
    checkFormIsValid(e.target.name)
  }

  /* Validation implemented here */
  const checkFormIsValid = (fieldName) => {
    const res = validateLoginFormData(userDetail, fieldName)
    setErrorsInfo(res.errors);
    return res.formVaildCheck;
  }

  const loginUserSubmit = async (e) => {
    e.preventDefault();
    if (checkFormIsValid('')) {
      try {
        dispatch(callCommonAction({ loading: true }));
        const res = await sendRequest(`/login`, 'POST', userDetail);
        dispatch(callCommonAction({ loading: false }));
        if (res.data.status) {
          localStorage.setItem("token", res.data.access_token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          dispatch(callCommonAction({ isLoggedIn: true, user: res.data.user, token: res.data.access_token }));
        }
      } catch (error) {
        toast.error(error.response.statusText)
        dispatch(callCommonAction({ loading: false }));
      }
    }
  }


  return (
    <>
      <Helmet>
        <title>Alium | Login Page</title>
        <meta name="description" content="Login Page Description Goes Here" />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="inner-page">
        <div className="container">
          <div className="form-wrap">
            <div className="col-12 form-group">
              <h2 className="h4 text-white mb-4">Login to your account</h2>
            </div>
            <div className="form-content login-content">
              <form className="form" noValidate onSubmit={loginUserSubmit}>
                <div className="col-12 form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" name="email" id="email" onChange={handleChange} defaultValue={userDetail.email} placeholder="Enter your email address" />
                  <span className='invalid-field'>{errorsInfo.email}</span>
                </div>
                <div className="col-12 form-group">
                  <label className="d-flex">Password <span className="ms-auto">Forgot password? <span className='anchor h-underline' onClick={() => navigate(appRoutes.forgotPasswordRoute)} >Reset it</span></span></label>
                  <div className="position-relative">
                    <input type={passwordType} className="form-control pe-5" name="password" onChange={handleChange} defaultValue={userDetail.password} id="password" placeholder="Password" />
                    <span className='invalid-field'>{errorsInfo.password}</span>
                    <div className="filed-icon">
                      <a href={undefined} onClick={togglePassword} >{passwordType === "password" ? <i className="fa fa-eye-slash" ></i> : <i className="fa fa-eye"></i>}</a>
                    </div>
                  </div>
                </div>
                {loading ?
                  <button type="button" className="btn btn-primary w-100">Login <span className="spinner-border" role="status"></span></button>
                  :
                  <button type="submit" className="btn btn-primary w-100">Login</button>
                }
              </form>
              <div className="form-info-bottom text-center">
                <p className="my-3 text-white">Don’t have an account? <span className='anchor h-underline' onClick={() => navigate(appRoutes.registerRoute)}>Register</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}