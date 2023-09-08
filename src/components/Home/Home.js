import React, { useState, useEffect } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import appRoutes from '../../configs/AppRoutes';
import Select from 'react-select';
import { Helmet } from 'react-helmet';


export default function Home() {
   const [homeData, setHomeData] = useState({});
   const dispatch = useDispatch();
   const [activeFeatureTab, setActiveFeatureTab] = useState('new_products');  
   const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
   const [serachString, setSerachString] = useState('');
   const navigate = useNavigate()

   useEffect(() => {
      getHomePageData();
   }, []);

   /** Get Home Page Data */
   const getHomePageData = async () => {
      try {
         dispatch(callCommonAction({ loading: true }));
         const res = await sendRequest(`/home-page`, 'GET');
         setHomeData(res.data.data);
         localStorage.setItem('categories', JSON.stringify(res.data.data.categories))
         dispatch(callCommonAction({ loading: false, categories: res.data.data.categories }));
      } catch (error) {
         dispatch(callCommonAction({ loading: false }));
      }
   }

   const searchData = () => {
      //console.log('selectedCategoryOption', selectedCategoryOption)
      let cat = selectedCategoryOption === null ? '' : selectedCategoryOption.value;
      navigate({
         pathname: '/' + appRoutes.productSearchListRoute,
         search: `?${createSearchParams({ category: cat, name: serachString })}`,
      })
   }
   /** Prepare html For Recently sold Products */
   const prepareRecentlySoldProduct = () => {
      return homeData.recently_sold_product.map((item, index) => {
         return (
            <div key={index}>
               <div className="item tranding" key={item.id}>
                  <h3 className='text-truncate'>{item.title}</h3>
                  <div className="tranding-img">
                     <LazyLoadImage effect="blur" src={item.display_thumb_path} />
                  </div>
                  <div className="trending-info">
                     <div className="d-flex action align-items-center">
                        {/* <span className="pe-3"><FontAwesomeIcon icon={faStar} className='neon-clr'></FontAwesomeIcon> {parseFloat(item.avg_rating).toFixed(1)}/5</span> */}
                        {/* <span className="ms-auto buy-btn"><a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.slug)} >Buy</a></span> */}
                     </div>
                  </div>
               </div>
            </div>
         )
      })
   }

   /** Prepare html For Feature Products */
   const prepareHtmlForFeaturedProducts = (selectedTab) => {
      return homeData[selectedTab].map((item) => {
         return (
            <div className="col-6 col-md-6 col-lg-3 mb-4" key={item.id}>
               <a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.slug)}>
                  <div className="p-3 tab-item d-flex align-items-center flex-column flex-md-row">
                     <div className="flex-shrink-0 tab-item-img">
                        <LazyLoadImage effect="blur" src={item.display_thumb_path} />
                     </div>
                     <div className="tab-item-text text-truncate">
                        <h4 className='text-truncate'>{item.title}</h4>
                        <p className="tab-item-price m-0">£ {item.price}</p>
                     </div>
                  </div>
               </a>
            </div>
         )
      })
   }

   /** Newly Added Image Display For Home */
   const prepareHtmlForNewlyAddedProducts = () => {
      return homeData.new_products.map((item, index) => {
         return index < 6 ?
            (
               <div className="col-6 col-md-4 col-lg-2 newly-item" key={item.id}>
                  <a href={undefined} onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.slug)}>
                     <div className="newly-item-img">
                        <LazyLoadImage effect="blur" src={item.display_thumb_path} />
                     </div>
                     <h3>{item.title}</h3>
                  </a>
               </div>
            )
            :
            null
      })
   }

   /** Check Length Of Product Detail Arry */
   const homeDataLen = (checkKey) => homeData.hasOwnProperty(checkKey) && homeData[checkKey].length


   const homeDataContent = (rootKeyOfObj, nextKeyObj, nestedKeyObj) => homeData[rootKeyOfObj][nextKeyObj].map((item) => item.param === nestedKeyObj ? item.value : null); 

   /** Responsive Crausel Multi Item */
   const responsive = {
      desktop: {
         breakpoint: { max: 3000, min: 1024 },
         items: 3,
         slidesToSlide: 3 // optional, default to 1.
      },
      tablet: {
         breakpoint: { max: 1024, min: 464 },
         items: 2,
         slidesToSlide: 2 // optional, default to 1.
      },
      mobile: {
         breakpoint: { max: 464, min: 0 },
         items: 1,
         slidesToSlide: 1 // optional, default to 1.
      }
   };

   return (
      <div>
         <Helmet>
            <title>Alium | Home Page</title>
            <meta name="description" content="Home Page Description Goes Here" />
            <meta name="keywords" content="Game, Entertainment, Movies" />
         </Helmet>
         <section id="hero">
            <div className="hero-content">
               <div
                  className="caption d-flex flex-column align-items-center position-relative">
                  {/* <div className="border-box"></div>
                  <div className="gradient-box"></div> */}
                  <h1>{homeData.hasOwnProperty('home_page_content') === true ? homeDataContent("home_page_content", "page_contents", "home_page_title",) : ''}</h1>
               </div>
               <p>{homeData.hasOwnProperty('home_page_content') === true ? homeDataContent("home_page_content", "page_contents", "home_page_title_description",) : ''}</p>
               <form>
                  <div className="search-bar d-flex align-items-center flex-wrap">
                     <div className="search-input me-auto">
                        <input type="text" placeholder="Search for your gaming needs..." onChange={(e) => setSerachString(e.target.value)} />
                     </div>
                     {homeData.categories
                        ?
                        <Select
                           className="basic-single"
                           classNamePrefix="select"
                           placeholder="All Categories"
                           isClearable={true}
                           isSearchable={true}
                           name={'category_id'}
                           options={homeData.categories}
                           value={selectedCategoryOption == null ? '' : selectedCategoryOption}
                           isMulti={false}
                           onChange={setSelectedCategoryOption}                           
                        />
                        :
                        null
                     }
                     <button type="button" className='ms-md-3'>
                        <FontAwesomeIcon icon={faMagnifyingGlass} inverse onClick={() => searchData()}></FontAwesomeIcon>
                     </button>
                  </div>
               </form>
            </div>
         </section >

         <div className="home-bg">
            {
               homeDataLen('recently_sold_product') > 0
                  ?
                  <section id="recently_sold_product">
                     <div className="container">
                        <div className="heading">
                           <h2 className="right">Recently Sold Products</h2>
                        </div>
                        <Carousel
                           swipeable={false}
                           draggable={false}
                           showDots={true}
                           responsive={responsive}
                           ssr={true} // means to render carousel on server-side.
                           infinite={true}
                           autoPlay={true}
                           autoPlaySpeed={2000}
                           keyBoardControl={true}
                           customTransition="transform 800ms ease-in-out"
                           transitionDuration={500}
                           containerClass="carousel-container"
                           removeArrowOnDeviceType={["tablet", "mobile"]}
                           deviceType=''
                           dotListClass="custom-dot-list-style"
                           itemClass="carousel-item-padding-40-px"
                        >
                           {prepareRecentlySoldProduct()}
                        </Carousel>;
                     </div>
                  </section>
                  :
                  null
            }

            <section id="newly_added">
               <div className="container">
                  <div className="heading text-center">
                     <h2 className="left">Newly Added</h2>
                  </div>
                  <div className="row">
                     {homeDataLen('new_products') > 0 ? prepareHtmlForNewlyAddedProducts() : null}
                  </div>
               </div>
            </section>

            <section id="how_work">
               <div className="container">
                  <div className="heading">
                     <h2 className="left">How It Works?</h2>
                  </div>
                  <div className="row how-work-bg">
                     <div className="col-12 col-md-6 col-lg-3 mb-4 mb-lg-0 px-md-2 py-md-0 py-2">
                        <div className="d-flex step">
                           <div className="step-img flex-shrink-0"><img className="first" src="/assets/images/1.png" alt="" title="" /></div>
                           <div className="step-text">
                              <h4><img src="/assets/images/audit.png" alt="" title="" /> Registration</h4>
                              <p>{homeData.hasOwnProperty('home_page_content') === true ? homeDataContent("home_page_content", "page_contents", "how_it_works_section_subtitle_1",) : ''}</p>
                           </div>
                        </div>
                     </div>
                     <div className="col-12 col-md-6 col-lg-3 mb-4 mb-lg-0 px-md-2 py-md-0 py-2">
                        <div className="d-flex step">
                           <div className="step-img flex-shrink-0"><img src="/assets/images/2.png" alt="" title="" /></div>
                           <div className="step-text">
                              <h4><img src="/assets/images/wallet.png" alt="" title="" /> Payment</h4>
                              <p>{homeData.hasOwnProperty('home_page_content') === true ? homeDataContent("home_page_content", "page_contents", "how_it_works_section_subtitle_2",) : ''}</p>
                           </div>
                        </div>
                     </div>
                     <div className="col-12 col-md-6 col-lg-3 mb-4 mb-lg-0 px-md-2 py-md-0 py-2">
                        <div className="d-flex step">
                           <div className="step-img flex-shrink-0"><img src="/assets/images/3.png" alt="" title="" /></div>
                           <div className="step-text">
                              <h4><img src="/assets/images/delivery.png" alt="" title="" /> Delivery</h4>
                              <p>{homeData.hasOwnProperty('home_page_content') === true ? homeDataContent("home_page_content", "page_contents", "how_it_works_section_subtitle_3",) : ''}</p>
                           </div>
                        </div>
                     </div>
                     <div className="col-12 col-md-6 col-lg-3 mb-4 mb-lg-0 px-md-2 py-md-0 py-2">
                        <div className="d-flex step">
                           <div className="step-img flex-shrink-0"><img src="/assets/images/4.png" alt="" title="" /></div>
                           <div className="step-text">
                              <h4><img src="/assets/images/verified.png" alt="" title="" /> Confirmation</h4>
                              <p>{homeData.hasOwnProperty('home_page_content') === true ? homeDataContent("home_page_content", "page_contents", "how_it_works_section_subtitle_4",) : ''}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section id="featured">
               <span className="left-line"></span>
               <span className="right-line"></span>
               <div className="container">
                  <div className="heading text-center">
                     <h2 className="left">Featured Products</h2>
                  </div>

                  <Tabs id="controlled-tab-example" activeKey={activeFeatureTab} onSelect={(k) => setActiveFeatureTab(k)} className="mb-3 pb-2">
                     <Tab eventKey="new_products" title="New Items">
                        <div className="row">
                           {homeDataLen('new_products') > 0 ? prepareHtmlForFeaturedProducts('new_products') : null}
                        </div>
                     </Tab>
                     <Tab eventKey="most_view_products" title="Most Views">
                        <div className="row">
                           {homeDataLen('most_view_products') > 0 ? prepareHtmlForFeaturedProducts('most_view_products') : null}
                        </div>
                     </Tab>
                  </Tabs>
               </div>
            </section>
         </div>
      </div>
   )
}
