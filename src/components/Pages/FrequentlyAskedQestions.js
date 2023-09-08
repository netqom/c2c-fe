import React, { useEffect, useState } from 'react'
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useDispatch } from 'react-redux';
import Accordion from "react-bootstrap/Accordion";
import Pagination from '../Pagination/pagination';
import AppConfig from '../../configs/AppConfig';
import { Helmet } from 'react-helmet';

const FrequentlyAskedQestions = () => {
  const dispatch = useDispatch();
  const [frequentlyAskedQestionsDetail, setFrequentlyAskedQestionsDetail] = useState({});
  const [askedQestionsList, setAskedQestionsList] = useState({});
  const [defaultActiveKey, setDefaultActiveKey] = useState(0);
  const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPageTable, page: 1, totalCount: 0 });

  useEffect(() => {
    //window.scrollTo(0, 0)
    getFaqPageData();
  }, [paginationData.page]);

  /** Get Home Page Data */
  const getFaqPageData = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      let body = { pagination: paginationData };
      const res = await sendRequest(`/frequently-asked-qestions`, 'POST', body);
      setFrequentlyAskedQestionsDetail(res.data.data);
      setAskedQestionsList(res.data.list.data);
      setPaginationData({ ...paginationData, totalCount: res.data.list.meta.total });
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  const prepareList = () => {
    return askedQestionsList.map((item, index) => {
      return (
        <Accordion.Item eventKey={index} key={index}>
          <Accordion.Header>{item.question}</Accordion.Header>
          <Accordion.Body>{item.answer}</Accordion.Body>
        </Accordion.Item>
      )
    });
  }

  const faqDataContent = (rootKeyOfObj, nextKeyObj) => frequentlyAskedQestionsDetail[rootKeyOfObj].map((item) => item.param == nextKeyObj ? item.value : null).filter(ele => ele != null);

  return (
    <>
      <Helmet>
        <title>{`Alium |  ${frequentlyAskedQestionsDetail.hasOwnProperty('id') ? faqDataContent('page_contents', 'meta_title') : 'Faq Page'}`}</title>
        <meta name="description" content={frequentlyAskedQestionsDetail.hasOwnProperty('id') ? faqDataContent('page_contents', 'meta_description') : ''} />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="banner-sec" style={{
        backgroundImage: `url(${frequentlyAskedQestionsDetail.hasOwnProperty('id') ? AppConfig.admin_backend_url + '/storage/' + faqDataContent('page_contents', 'banner_image') : ''})`
      }}>
        <div className="banner-caption">
          <div className="hero-content">
            <div className="caption d-flex flex-column align-items-center position-relative">
              <div className="border-box"></div>
              <div className="gradient-box"></div>
              <h1>FAQ</h1>
            </div>
          </div>
        </div>
      </section>
      <section className="inner-content">
        <div className="container">
          <Accordion defaultActiveKey={defaultActiveKey}>
            {askedQestionsList.length ? prepareList() : null}
          </Accordion>
        </div>
        <div className='pag'>
          <Pagination className="pagination-bar" currentPage={paginationData.page} totalCount={paginationData.totalCount}
            pageSize={paginationData.perpage} onPageChange={page => setPaginationData({ ...paginationData, page: page })}
          />
        </div>
      </section>
    </>
  );
};
export default FrequentlyAskedQestions;
