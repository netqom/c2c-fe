import React,{ useEffect } from 'react'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { AppSettings } from '../../configs'
import { Helmet } from 'react-helmet';

function AboutUs() {
   const dispatch = useDispatch();
   const [aboutUsData, setAboutUsData] = useState({});

   useEffect(() => {
      window.scrollTo(0, 0)
      getAboutUsPageData();
   }, []);

   /** Get Home Page Data */
   const getAboutUsPageData = async () => {
      try {
         dispatch(callCommonAction({ loading: true }));
         const res = await sendRequest(`/about-us`, 'GET');
         setAboutUsData(res.data.data);
         dispatch(callCommonAction({ loading: false }));
      } catch (error) {
         dispatch(callCommonAction({ loading: false }));
      }
   }

   /** Check Length Of Product Detail Arry */
   const aboutDataLen = (checkKey) => aboutUsData.hasOwnProperty(checkKey) && aboutUsData[checkKey].length

   const aboutDataContent = (rootKeyOfObj,nextKeyObj) => aboutUsData[rootKeyOfObj].map((item) => item.param == nextKeyObj ? item.value : null).filter(ele => ele != null);
   
   return (
      <div>
         <Helmet>
            <title>{`Alium |  ${aboutDataLen('page_contents') > 0 ? aboutDataContent('page_contents','meta_title') : 'About Us' }`}</title>
            <meta name="description" content={aboutDataLen('page_contents') > 0 ? aboutDataContent('page_contents','meta_description') : ''} />
            <meta name="keywords" content="Game, Entertainment, Movies" />
         </Helmet>

         <section className="banner-sec">
            <div className="banner-caption">
               <div className="hero-content">
            <div className="caption d-flex flex-column align-items-center position-relative">
              <div className="border-box"></div>
              <div className="gradient-box"></div>
              <h1>About Us</h1>
            </div>
          </div>
            </div>
         </section>

         <section className="inner-content">
            <div className="container">

               <div className='row flex-column flex-md-row align-items-center mb-4'>
                  <div className='col col-md-5 mb-3'>
                     <img src= { aboutDataLen('page_contents') > 0 ? AppSettings.admin_backend_url +'/storage/'+aboutDataContent('page_contents','image_1') : '' } alt='' title='' />

                  </div>
                  <div className='col col-md-7'>
                     { aboutDataLen('page_contents') > 0 ? <div className='text-white mb-3' dangerouslySetInnerHTML={{__html: aboutDataContent('page_contents','description_1') }}></div>: '' }
                  </div>
               </div>

               <div className='row flex-column flex-md-row align-items-center mb-4 flex-md-row-reverse'>
                  <div className='col col-md-5 mb-3 text-md-end'>
                  <img src= { aboutDataLen('page_contents') > 0 ? AppSettings.admin_backend_url +'/storage/'+aboutDataContent('page_contents','image_2') : '' } alt='' title='' />
                  </div>
                  <div className='col col-md-7'>
                     { aboutDataLen('page_contents') > 0 ? <div className='text-white mb-3' dangerouslySetInnerHTML={{__html: aboutDataContent('page_contents','description_2') }}></div>: '' }
                  </div>
               </div>

            </div>
         </section>
      </div>
   )
}

export default AboutUs;