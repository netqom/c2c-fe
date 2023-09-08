import React, { useEffect, useState } from 'react'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useDispatch } from 'react-redux';
import AppConfig from '../../configs/AppConfig';
import { Helmet } from 'react-helmet';

function PrivacyPolicy() {
  const dispatch = useDispatch();
  const [privacyPolicy, setPrivacyPolicy] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0)
    getPrivacyPolicyData();
  }, [])

  /** Get Term Page Data */
  const getPrivacyPolicyData = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const res = await sendRequest(`/privacy-policy`, 'GET');
      setPrivacyPolicy(res.data.data);
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  /** Check Length Of Product Detail Arry */
  const privacyPolicyDataLen = (checkKey) => privacyPolicy.hasOwnProperty(checkKey) && privacyPolicy[checkKey].length

  const privPolContent = (rootKeyOfObj, nextKeyObj) => privacyPolicy[rootKeyOfObj].map((item) => item.param == nextKeyObj ? item.value : null).filter(ele => ele != null);

  return (
    <div>
      <Helmet>
        <title>{`Alium |  ${privacyPolicyDataLen('page_contents') > 0 ? privPolContent('page_contents', 'meta_title') : 'Privacy Policy Page'}`}</title>
        <meta name="description" content={privacyPolicyDataLen('page_contents') > 0 ? privPolContent('page_contents', 'meta_description') : ''} />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="banner-sec" style={{
        backgroundImage: `url(${privacyPolicy.hasOwnProperty('id') ? AppConfig.admin_backend_url + '/storage/' + privPolContent('page_contents', 'banner_image') : ''})`
      }}>
        <div className="banner-caption">
          <div className="hero-content">
            <div className="caption d-flex flex-column align-items-center position-relative">
              <div className="border-box"></div>
              <div className="gradient-box"></div>
              <h1>Privacy Policy</h1>
            </div>
          </div>
        </div>
      </section>
      <section className="inner-content">
        <div className="container">
          {
            privacyPolicyDataLen('page_contents') > 0
              ?
              <div className="privacy-policy" dangerouslySetInnerHTML={{ __html: privPolContent('page_contents', 'privacy_policy') }}></div>
              :
              null
          }
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicy;