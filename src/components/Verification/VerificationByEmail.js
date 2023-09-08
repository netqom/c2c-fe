import React,{useState,useEffect} from 'react'
import { useDispatch, useSelector} from 'react-redux'
import { useParams,useNavigate } from "react-router-dom";
import { callCommonAction } from '../../redux/Common/CommonReducer'
import { sendRequest } from '../../apis/APIs';
import appRoutes from '../../configs/AppRoutes';
const AppHeader = React.lazy(() => import('../Header/AppHeader'))
const AppFooter = React.lazy(() => import('../Footer/AppFooter'))

export default function VerificationByEmail(props) {
  const { verificationCode } = useParams();
  const navigate = useNavigate();
  const [verifyCode, setVerifyCode] = useState('');
  const { loading } = useSelector((state) => state.common)
  const dispatch = useDispatch();

  useEffect(() => {
    setVerifyCode(verificationCode);
    verifyEmailAddress(verificationCode);
  }, []);

  /** Verify Email Address Form Submit */
  const verifyEmailAddress = async (verificationCode) => {
   // e.preventDefault();
      try {
        dispatch(callCommonAction({ loading: true }));
        const res = await sendRequest(`/email-verify`, 'POST', {verifyCode:verificationCode});
        // if (res.data.status) {
          navigate(appRoutes.loginRoute);
				// }
        dispatch(callCommonAction({ loading: false }));
      } catch (error) {
        console.log('erroor submitForgetPasswordForm ====> ', error);
        dispatch(loading({ loading: false }));
      }
  }

  return (
    <>
      {/* <AppHeader />
      <section className="inner-page">
        <div className="container">
          <div className="form-wrap">
            <div className="col-12 form-group">
              <h2 className="h4 text-white mb-4">Verification Email Address</h2>
            </div>
            <div className="form-content login-content">
              <form className="form" noValidate onSubmit={verifyEmailAddress}>
                <div className="col-12 form-group">
                  <label>Verification Code </label>
                  <input className="form-control" type="text" name="verify_code" readOnly defaultValue={verificationCode} placeholder="Verification Code" />
                </div>
                <button type="submit" className="btn btn-primary w-100">Verify Email   {loading ? <span className="spinner-border" role="status"></span> : ''} </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <AppFooter /> */}
    </>
  )
}
