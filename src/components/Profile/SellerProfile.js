import React, { useEffect, useState } from 'react'
import { faCircleDollarToSlot, faListCheck, faStar, faUserTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendRequest } from '../../apis/APIs';
import Pagination from '../Pagination/pagination';
import AppConfig from '../../configs/AppConfig';
import moment from 'moment';
import { ContentLoading } from '../Common/ContentLoading';
import appRoutes from '../../configs/AppRoutes';
import { Helmet } from 'react-helmet';

const SellerProfile = () => {
   const { user, loading } = useSelector((state) => state.common);
   const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPage, page: 1, totalCount: 0 });
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const [productList, setProductList] = useState({});
   const [reviewList, setReviewList] = useState({});
   const [sellerDetail, setSellerDetail] = useState({});
   const [soldProduct, setSoldProduct] = useState(0);
   const [tabSelect, setTabSelect] = useState('1');
   const { seller_id } = useParams();
   const [showMore, setShowMore] = useState(false);
   const [expandedItems, setExpandedItems] = useState([]);

   useEffect(() => {
      getSellerProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [paginationData.page]);

   /** Get the product Detail  */
   const getSellerProfile = async () => {
      try {
         dispatch(callCommonAction({ loading: true }));
         let body = { pagination: paginationData };
         // Set search filter and passs as query 
         body.query = { seller_id: seller_id, sort_field: '', search_string: '', min_price: '0', max_price: '0', category_id: 0 };
         const res = await sendRequest(`/get-seller-profile`, 'POST', body);
         setProductList(res.data.data.product_list);
         setReviewList(res.data.data.review_list);
         setSellerDetail(res.data.data.seller_detail);
         setSoldProduct(res.data.data.sold_product);
         setPaginationData({ ...paginationData, totalCount: res.data.data.product_list.meta.total })
         if (tabSelect === '2') {
            setPaginationData({ ...paginationData, totalCount: res.data.data.review_list.meta.total })
         }
         dispatch(callCommonAction({ loading: false }));
      } catch (error) {
         dispatch(callCommonAction({ loading: false }));
      }
   }

   /**Set Pagination page on change */
   const callSetPage = (page) => {
      setPaginationData({ ...paginationData, page: page })
   }

   /**  Length count common function */
   const dataLengthCount = (source) => {
      if (source.hasOwnProperty('data')) {
         if (source.data.length > 0) {
            return true;
         }
      }
      return false;
   }

   /**Prepare Html For Product List */
   const prepareHtmlForProductList = () => {
      return productList.data.map((product, index) => {
         const categoriesName = product.product_categories.map((pCat) => pCat.category.name).join(', ');
         return (

            <div className="col mb-2 mb-lg-5" key={index}>
               <div className="card flex-row flex-lg-column bg-transparent border-0">
                  <div className="card-img flex-shrink-0 mb-3 me-3 me-lg-0">
                     <a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + product.slug)}>
                        <img src={product.display_path} alt="" title="" />
                     </a>
                  </div>
                  <div className="card-texts">
                     <div className="cat-name text-truncate"><a href={undefined}>{categoriesName}</a> </div>
                     <h3><a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + product.slug)}>{product.title}</a> </h3>
                     <div className='d-flex justify-content-between'>
                        <div className="price-text">£{parseFloat(product.price).toFixed(2)}</div>
                        <div className="price-text sold-out"><strong>{product.quantity === 0 ? 'Sold Out' : 'Product Available'}</strong></div>
                     </div>
                     <hr />
                  </div>
               </div>
            </div>
         )
      })

   }

   const toggleItem = (itemId) => {
      if (expandedItems.includes(itemId)) {
         setExpandedItems(expandedItems.filter((id) => id !== itemId));
      } else {
         setExpandedItems([...expandedItems, itemId]);
      }
   };

   /**Prepare Html For Review List */
   const prepareHtmlForReviewList = () => {
      return reviewList.data.map((review, indexStar) => {
         var displayStar = [];
         for (var i = 0; i < review.rating; i++) {
            displayStar.push(<FontAwesomeIcon icon={faStar} className='neon-clr me-1' />);
         }
         return (
            <div className="seller-reviews_review-box p-3" key={indexStar}>
               <div className="seller-reviews_review-info-wrapper d-flex mb-2">
                  <div className="seller-reviews_review-avatar">
                     <img className="avatar48" src={review.creater_image} alt="Bk**gy" /></div>
                  <div className="seller-reviews_review-info-container">
                     <div>
                        <h6 className="mb-1 text-white">{review.created_by_user_name}</h6>
                     </div>
                     <div className="d-flex align-items-center seller-reviews_review-rating-wrapper">
                        <div className="me-2 seller-reviews_review-rate">
                           {displayStar}
                        </div>
                        <div className="seller-reviews_time">{moment(review.created_at).format('MMM DD, yyyy')}</div>
                     </div>
                  </div>
               </div>
               <div className="seller-reviews_review-text">
                  <div className="body-p3 text-white">
                     {expandedItems.includes(review.id) ? review.review : `${review.review.substring(0, 300) + '.....'}`}
                  </div>
                  <button className="btn btn-primary mt-2" onClick={() => toggleItem(review.id)}>
                     {expandedItems.includes(review.id) ? "Show Less" : "Show More"}
                  </button>
               </div>
            </div>
         )
      })
   }

   /** Handle Select tab and pagination*/
   const handleSelectTab = (key) => {
      setTabSelect(key);
      if (key === '1') {
         setPaginationData({ ...paginationData, page: 1, totalCount: productList.meta.total })
      } else {
         setPaginationData({ ...paginationData, page: 1, totalCount: reviewList.meta.total })
      }
   }

   return (

      <div className='inner-page'>
         <Helmet>
            <title>Alium | Seller Profile Page</title>
            <meta name="description" content="Seller Profile Page Description Goes Here" />
            <meta name="keywords" content="Game, Entertainment, Movies" />
         </Helmet>
         <div className='container'>
            <div className='row justify-content-between seller-profile m-0'>
               <div className='filter-sec mb-4 mb-md-0'>
                  <div className="sidebar-wrap">
                     <div className='text-center mb-2'>
                        <div className='profile-img mb-4'>
                           <img src={Object.keys(sellerDetail).length !== 0 ? sellerDetail.display_user_image : ''} alt='' title='' />
                        </div>
                        <h3 className="h5" style={{ textTransform: 'capitalize' }}>{Object.keys(sellerDetail).length !== 0 ? sellerDetail.name : ''}</h3>
                        <div className='seller-rating'>
                           {Object.keys(sellerDetail).length !== 0 ? sellerDetail.avg_rating.toFixed(1) : '0.0'} <FontAwesomeIcon icon={faStar} className='neon-clr' />
                        </div>
                     </div>
                     <div className="d-inline-block w-100 ">
                        <hr className="opacity-25" />
                     </div>
                     <ul className='sidebar-list mt-2 '>
                        {/* <li key={"seller-tier"}>
                           <span className='icon-space'>
                              <FontAwesomeIcon icon={faUserTag} className='neon-clr' />
                           </span>
                           <span>Seller Tiers</span>
                           <span className='value-text'>Normal</span>
                        </li> */}
                        <li key={"seller-product"}>
                           <span className='icon-space'>
                              <FontAwesomeIcon icon={faListCheck} className='neon-clr' />
                           </span>
                           <span>Total Products</span>
                           <span className='value-text'>{dataLengthCount(productList) ? productList.meta.total : 0}</span>
                        </li>
                        <li key={"seller-orders"}>
                           <span className='icon-space'>
                              <FontAwesomeIcon icon={faCircleDollarToSlot} className='neon-clr' />
                           </span>
                           <span>Completed Orders</span>
                           <span className='value-text'>{soldProduct}</span>
                        </li>
                     </ul>
                     <div className=''>
                        <div className="d-inline-block w-100">
                           <hr className="opacity-25" />
                        </div>
                        <div className='mb-4'>
                           <p className='mb-1'><strong>Member since {moment(user.created_at).format('MMM DD, yyyy')}</strong></p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className='list-rightPanel'>
                  <Tabs defaultActiveKey={1} id="uncontrolled-tab-example" className="mb-3 pb-2" onSelect={handleSelectTab}>
                     <Tab eventKey={1} title="All Products" >
                        <div className='row row-cols-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-4'>
                           {dataLengthCount(productList) ? prepareHtmlForProductList() : null}
                        </div>
                     </Tab>
                     <Tab eventKey={2} title="Seller Reviews" className="ml-3">
                        <div className="col-12 mb-3">
                           {dataLengthCount(reviewList) ? prepareHtmlForReviewList() : null}
                        </div>
                     </Tab>
                  </Tabs>
                  {loading ? <ContentLoading /> : null}
                  <Pagination className="pagination-bar" currentPage={paginationData.page} totalCount={paginationData.totalCount}
                     pageSize={paginationData.perpage} onPageChange={page => callSetPage(page)}
                  />
               </div>
            </div>
         </div>
      </div>
   )
}
export default SellerProfile