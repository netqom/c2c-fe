import React, { useEffect } from 'react'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import AppConfig from '../../configs/AppConfig';
import { Helmet } from 'react-helmet';

function Feature() {
  const dispatch = useDispatch();
  const [featureData, setFeatureData] = useState({});
  const [featureList, setFeatureList] = useState({});
  useEffect(() => {
    window.scrollTo(0, 0)
    getFeaturePageData();
  }, [])

  /** Get Feature Page Data */
  const getFeaturePageData = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const res = await sendRequest(`/feature-list`, 'GET');
      setFeatureData(res.data.data);
      setFeatureList(res.data.list);
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  const featureDataContent = (rootKeyOfObj, nextKeyObj) => featureData[rootKeyOfObj].map((item) => item.param == nextKeyObj ? item.value : null).filter(ele => ele != null);

  return (
    <div>
      <Helmet>
        <title>{`Alium |  ${featureData.hasOwnProperty('id') ? featureDataContent('page_contents', 'meta_title') : 'Feature Page'}`}</title>
        <meta name="description" content={featureData.hasOwnProperty('id') ? featureDataContent('page_contents', 'meta_description') : ''} />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>

      <section className="banner-sec">
        <div className="banner-caption">
          <div className="hero-content">
            <div className="caption d-flex flex-column align-items-center position-relative">
              <div className="border-box"></div>
              <div className="gradient-box"></div>
              <h1>Alium Features</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="inner-content">
        <div className="container">
          {featureList.length > 0
            ?
            featureList.map((item, index) => {
              return (
                <>
                  <div className="row flex-column flex-md-row align-items-center  feature-row mb-5 mb-md-0" key={index}>
                    <div className="col col-md-6 mb-3 mb-md-0 imgs">
                      <img className="" src={AppConfig.admin_backend_url + '/storage/' + item.image} alt="" title="" />
                    </div>
                    <div className="col col-md-6 texts" dangerouslySetInnerHTML={{ __html: item.description }}></div>
                  </div>
                  { 
                    (featureList.length - 1) == index ? null
                      :
                      <div className="row">
                        <div className="col-12 text-center">
                          <img className="connect-line d-none d-md-block mx-auto" src={`${(index % 2) == 0 ? 'assets/images/fe-linetop.png' : 'assets/images/fe-linebot.png'}`} alt="" title="" />
                        </div>
                      </div>
                  }
                </>
              )
            })
            :
            'There is no feature list available'
          }
        </div>
      </section>
    </div>
  );
}

export default Feature;
