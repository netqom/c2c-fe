import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import SearchFilter from './SearchFilter';
import { callCommonAction } from '../../../redux/Common/CommonReducer'
import AppConfig from '../../../configs/AppConfig';
import { sendRequest } from '../../../apis/APIs';
import appRoutes from '../../../configs/AppRoutes';
import { ContentLoading } from '../../Common/ContentLoading';
import Pagination from '../../Pagination/pagination';
import { Helmet } from 'react-helmet';

function SearchProductList() {
   const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPage, page: 1, totalCount: 0 });
   const [productList, setProductList] = useState([]);
   const [show, setShow] = useState(false);
   const handleClose = () => setShow(false);
   const handleShow = () => setShow(true);
   const { user, loading, pageLoading } = useSelector((state) => state.common)
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const [pageNumberClick, setPageNumberClick] = useState(false);



   const handleSearchFilter = async (catId, filerParams, selectedSortedOption) => {
      try {
         dispatch(callCommonAction({ loading: true, pageLoading: pageLoading }));
         let body = { pagination: paginationData };
         // Set search filter and passs as query 
         body.query = { lng: user.lng, lat: user.lat, distance_in_miles: filerParams.distance_in_miles, sort_field: selectedSortedOption.value, search_string: filerParams.name, min_price: filerParams.min_price, max_price: filerParams.max_price, category_id: catId };
         const res = await sendRequest(`/search-product-list`, 'POST', body);
         setProductList(res.data.data);
         setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
         dispatch(callCommonAction({ loading: false, pageLoading: false }));
      } catch (error) {
         dispatch(callCommonAction({ loading: false }));
      }
   }


   /** Prepare html For Products List */
   const prepareHtmlForProductList = () => {
      return productList.map((item,key) => {
         const categoriesName = item.product_categories.map((pCat) => pCat.category.name).join(', ');
         return (
            <div className="col mb-2 mb-lg-5" key={key}>
               <div className="card flex-row flex-lg-column bg-transparent border-0">
                  <div className="card-img flex-shrink-0 mb-3 me-3 me-lg-0">
                     <a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.slug)}><img src={item.display_path} alt="" title="" /></a>
                  </div>
                  <div className="card-texts">
                     <div className="cat-name text-truncate"><a href={undefined}>{categoriesName}</a> </div>
                     <h3><a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.slug)}>{item.title}</a> </h3>
                     <div className='d-flex justify-content-between'>
                        <div className="price-text">£{item.price}</div>
                        <div className="price-text sold-out"><strong>{item.quantity === 0 ? 'Sold Out' : 'Stock Available'}</strong></div>
                     </div>
                     <hr />
                     <div className="d-flex align-items-center">
                        <div className='d-flex align-items-center text-truncate'>
                           <div className='flex-shrink-0'><img className="avatar30" src={item.users.display_user_image} alt="" title="" /></div>
                           <div className="pe-2 text-truncate card-person-name"><a href={undefined} onClick={() => navigate(appRoutes.sellerProfileRoute + '/' + item.users.id)}>{item.users.name}</a></div>
                        </div>
                        <div className="d-flex align-items-center flex-shrink-0">
                           <div className="rating-text">
                           {`${parseFloat(item.users.avg_rating).toFixed(1)} (${item.users.rating_count})`}  <FontAwesomeIcon icon={faStar} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )
      })
   }

   const callSetPage = (page) => {
      setPageNumberClick(!pageNumberClick)
      setPaginationData({ ...paginationData, page: page })
   }

   return (
      <>
         <Helmet>
            <title>Alium | Product List Page</title>
            <meta name="description" content="Product List Description Goes Here" />
            <meta name="keywords" content="Game, Entertainment, Movies" />
         </Helmet>
         <div className='inner-page'>
            <div className='container'>
               <div className="text-white mb-4">
                  <h5>Search result:</h5>
                  <p>{`${paginationData.totalCount} item(s) found for`}</p>
               </div>
               <div className='row justify-content-between'>
                  <div className='filter-sec'>
                     <SearchFilter handleSearchFilter={handleSearchFilter} pageNumberClick={pageNumberClick} />
                  </div>
                  <div className='list-rightPanel'>
                     <ContentLoading />
                     {
                        productList.length > 0 ?
                           <>
                              <div className="row row-cols-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-4">
                                 {prepareHtmlForProductList()}
                              </div>
                              <div className='pag'>
                                 <Pagination className="pagination-bar" currentPage={paginationData.page} totalCount={paginationData.totalCount}
                                    pageSize={paginationData.perpage} onPageChange={page => callSetPage(page)}
                                 />
                              </div>
                           </>
                           :
                           <div className="no-result text-center">
                              <img src="/assets/images/no-result.jpg" />
                           </div>
                     }
                  </div>
               </div>

               <div className='mobile-bottom-fix d-md-none'>
                  <Button variant="primary" onClick={handleShow} className='highlight-btn mb-3'>
                     <img src='/assets/images/filters.svg' alt='' title='' /> Filters
                  </Button>
               </div>

               <Modal show={show} onHide={handleClose} className='filter-modal'>
                  <Modal.Header closeButton variant="white">
                     <Modal.Title>Filters</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                     <SearchFilter handleSearchFilter={handleSearchFilter} />
                  </Modal.Body>
               </Modal>
            </div>
         </div>
      </>
   );
}

export default SearchProductList;

