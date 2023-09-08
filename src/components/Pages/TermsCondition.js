import React, { useEffect, useState } from 'react'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useDispatch } from 'react-redux';
import AppConfig from '../../configs/AppConfig';
import { Helmet } from 'react-helmet';

function TermsCondition() {
  const dispatch = useDispatch();
  const [termsAndConData, setTermsAndConData] = useState({});
  useEffect(() => {
    window.scrollTo(0, 0)
    getTermsAndConData();
  }, [])

  /** Get Term Page Data */
  const getTermsAndConData = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const res = await sendRequest(`/terms-and-conditions`, 'GET');
      setTermsAndConData(res.data.data);
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  /** Check Length Of Product Detail Arry */
  const termsDataLen = (checkKey) => termsAndConData.hasOwnProperty(checkKey) && termsAndConData[checkKey].length

  const termAndConContent = (rootKeyOfObj, nextKeyObj) => termsAndConData[rootKeyOfObj].map((item) => item.param == nextKeyObj ? item.value : null).filter(ele => ele != null);

  return (
    <div>
      <Helmet>
        <title>{`Alium |  ${termsDataLen('page_contents') > 0 ? termAndConContent('page_contents', 'meta_title') : 'Terms & Conditions Page'}`}</title>
        <meta name="description" content={termsDataLen('page_contents') > 0 ? termAndConContent('page_contents', 'meta_description') : ''} />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="banner-sec" style={{
        backgroundImage: `url(${termsAndConData.hasOwnProperty('id') ? AppConfig.admin_backend_url + '/storage/' + termAndConContent('page_contents', 'banner_image') : ''})`
      }}>
        <div className="banner-caption">
          <div className="hero-content">
            <div className="caption d-flex flex-column align-items-center position-relative">
              <div className="border-box"></div>
              <div className="gradient-box"></div>
              <h1>Terms and Condition</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="inner-content">
        <div className="container">
          {
            termsDataLen('page_contents') > 0
              ?
              <div className="privacy-policy" dangerouslySetInnerHTML={{ __html: termAndConContent('page_contents', 'terms_and_conditions') }}></div>
              :
              null
          }
        </div>
      </section>
    </div>
  )
}

export default TermsCondition;