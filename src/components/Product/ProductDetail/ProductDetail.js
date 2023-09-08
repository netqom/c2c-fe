import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import { callCommonAction } from '../../../redux/Common/CommonReducer';
import { sendRequest } from '../../../apis/APIs';
import { useNavigate } from 'react-router-dom';
import ImageSliderPopUp from './ImageSliderPopUp';
import VideoSliderPopUp from './VideoSliderPopUp';
import ReviewRating from './ReviewRating';
import SimilarProducts from './SimilarProducts';
import { faStar, faArrowLeft, faEdit, faList, faComment, faVideo, faMoneyCheck, faPaperPlane, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appRoutes from '../../../configs/AppRoutes';
import { Helmet } from 'react-helmet';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import ReadMoreComponent from '../../Common/ReadMoreComponent';

export default function ProductDetail(props) {
  const { user, isLoggedIn } = useSelector((state) => state.common);
  const navigate = useNavigate();
  const [productDetail, setProductDetail] = useState([]);
  const [similarProduct, setSimilarProduct] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hasOffer, setHasOffer] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offerMsg, setOfferMsg] = useState('');
  const [productUser, setProductUser] = useState({});
  const [chatWithSellerClass, setChatWithSellerClass] = useState('none');
  const [numberOfItemAddedInCart, setNumberOfItemAddedInCart] = useState(1);
  const dispatch = useDispatch();
  const { slug } = useParams();
  const imageSliderPopUpRef = useRef();
  const videoSliderPopUpRef = useRef();
  const [offerAmt, setofferAmt] = useState(0);
  const [offerModel, setOfferModel] = useState(false);
  const [estimateDeliveryTime, setEstimateDeliveryTime] = useState([]);

  useEffect(() => {
    callProductDetailApi()
  }, [slug]);

  /** Get the product Detail  */
  const callProductDetailApi = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      let user_id = user.hasOwnProperty('id') ? user.id : 0;
      const res = await sendRequest(`/get-product-detail`, 'GET', { slug: slug, user_id: user_id });
      if (res.data.status == false) {
        navigate(appRoutes.dashboardRoute);
      }
      setProductDetail(res.data.data);
      if (res.data.has_offer == '1') {
        setOfferMsg('You already sent offered against this product');
      }
      setHasOffer(res.data.has_offer);
      setProductUser(res.data.data.users);
      setSimilarProduct(res.data.similar_items);
      setEstimateDeliveryTime(res.data.estimate_delivery_time)
      setReviews(res.data.reviews);
      setChatWithSellerClass(user.hasOwnProperty('id') && user.id != res.data.data.created_by ? 'flex' : 'none')
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  /** Check Length Of Product Detail Arry */
  const proImg = () => productDetail && productDetail.hasOwnProperty('product_images') && productDetail.product_images.length;

  const startChatWithSeller = async (seller_id, product_id, sendOffer) => {
    try {
      if (sendOffer == '') {
        dispatch(callCommonAction({ loading: true }));
      }
      const res = await sendRequest('/start-chat', 'POST', { seller_id: seller_id, product_id: product_id, send_offer: sendOffer })
      if (res.data.status) {
        if (sendOffer != '') {
          setHasOffer(1);
          setOfferMsg('');
          toast.success('Your offer has been sent successfully.');
        } else {
          navigate(appRoutes.authPrfixRoute + '/' + appRoutes.chatRoute + '/' + res.data.data)
        }
      }
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  }

  /***** Handle Counter Offer Amount Only */
  const handleCountOffAmt = (e) => {
    if (/^\d*\.?\d*$/.test(e.target.value)) {
      let howManyDigitAfterDecimal = e.target.value.includes('.') ? e.target.value.toString().split('.')[1].length : 0;
      if (howManyDigitAfterDecimal <= 2) {
        setofferAmt((e.target.value));
      }
    }
  }

  const counterOfferForm = () => {
    return (
      <Modal show={offerModel} onHide={() => setOfferModel(false)}>
        <Modal.Header className='bg-primary modal-header text-white ' closeButton>
          <Modal.Title className='h6'><FontAwesomeIcon icon={faMoneyCheck} /> Send Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body className='py-4'>
          <label className='mb-1'>Offer Amount</label>
          <div className="input-group">
            <span className="bg-primary input-group-text text-white" id="basic-addon1">$</span>
            <input type="text" name="counter_offer_amount" onChange={handleCountOffAmt} value={offerAmt} className="form-control" placeholder="Enter offer amount" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn btn-primary btn-sm' onClick={handleSubmitOffer}><FontAwesomeIcon icon={faPaperPlane} /> Send Offer</Button>
          <Button className='btn btn-danger btn-sm' onClick={() => setOfferModel(false)}><FontAwesomeIcon icon={faCircleXmark} /> Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const handleSubmitOffer = async () => {
    if (parseFloat(offerAmt) === 0 || offerAmt == '') {
      toast.error("Please enter valid amount");
    } else {
      let content = `Offered £${parseFloat(offerAmt).toFixed(2)} for this product`
      let rawData = { content: content, offer_amt: parseFloat(offerAmt).toFixed(2) }
      Object.keys(user).length !== 0 ? startChatWithSeller(productDetail.created_by, productDetail.id, rawData) : navigate(appRoutes.loginRoute)
      setofferAmt(0);
      setOfferModel(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Alium | Product Detail Page</title>
        <meta name="description" content="Product Detail Description Goes Here" />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <section className="inner-page">
        <div className="container">

          <div className="d-flex mb-3 detail-action-bar">
            <div className="action-left  d-flex justify-content-between w-100">
              <button className="back-btn" type="button" onClick={() => navigate(-1)}><FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon><span> Back</span></button>
              {productDetail && isLoggedIn && user.id == productDetail.created_by && productDetail.quantity != 0 ? <button className="back-btn" type="button" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productFormRoute + '/' + productDetail.id)}><FontAwesomeIcon icon={faEdit} className='text-success' /><span> Edit</span></button> : null}
            </div>
          </div>

          {/* On Load Banner Image Display Format */}
          <div className="row" onClick={() => imageSliderPopUpRef.current.handleShow()}>
            <div className={`detail-banner mb-3 number-of-img-${proImg() ? productDetail.product_images.length : 0}`}>
              <div className="row">
                <div className={`col-md-${proImg() == 1 ? 12 : 9} detail-img-full`}>
                  <img className="detail-banner-img" onClick={() => setSelectedIndex(0)} src={proImg() ? productDetail.product_images[0].url : ''} alt="" title="" />
                </div>
                <div className={`col-md-3 p-0 small-images ${proImg() >= 2 ? 'd-block' : 'd-none'}`}>
                  <div className={`detail-img-half mb-3 ${proImg() == 2 ? 'h-100' : ''}`}>
                    <img className="detail-banner-img" onClick={() => setSelectedIndex(1)} src={proImg() >= 2 ? productDetail.product_images[1].url : ''} alt="" title="" />
                  </div>
                  <div className={`detail-img-half mb-3 ${proImg() >= 3 ? 'd-block' : 'd-none'}`}>
                    <img className="detail-banner-img" onClick={() => setSelectedIndex(2)} src={proImg() >= 3 ? productDetail.product_images[2].url : ''} alt="" title="" />
                  </div>
                </div>
              </div>
            </div>
            {/* Pop up for click on one of the banner image */}
            <ImageSliderPopUp productDetail={productDetail} selectedIndex={selectedIndex} ref={imageSliderPopUpRef} />
          </div>

          {offerModel ? counterOfferForm() : null}

          <div className="row">
            <div className="col-lg-8 detail-left mb-md-4 pe-md-4">
              <div className="detail-title mb-4">
                <span className="d-block cat-name">{productDetail && productDetail.type_name}</span>
                <h1>{productDetail && productDetail.title}</h1>
              </div>

              <div className="card-cstm mb-4">
                <div className="card-body">
                  <div className="desc-content">
                    {
                      offerMsg != '' && hasOffer && productDetail.quantity ? <><p className="alert alert-danger p-2 text-center">{offerMsg}</p></> : null
                    }
                    <div className="d-flex dashed-border flex-wrap align-items-start justify-content-start flex-md-nowrap">
                      <div className="d-flex offer-info align-items-center mb-3 mb-md-0 pe-4">
                        <div className="offer-info-img flex-shrink-0"><img className="avatar48" src={productUser.display_user_image} alt="" title="" /></div>
                        <div className="offer-info-text">
                          <h6 className="m-0 f-bold"><a onClick={() => navigate(appRoutes.sellerProfileRoute + '/' + productDetail.created_by)} className="text-white" o href={undefined}><strong>{productUser.name}</strong></a></h6>
                          <div className="online-status active">
                            <span className="offer-info-ratting">{parseFloat(productUser.avg_rating).toFixed(1)} <FontAwesomeIcon icon={faStar}></FontAwesomeIcon></span>
                          </div>
                        </div>
                      </div>
                      <div className={`chat-btn ms-0 ms-md-auto flex-shrink-0 d-${chatWithSellerClass}`}>
                        {productDetail.quantity == 0 ? null
                          : <button onClick={() => Object.keys(user).length !== 0 ? startChatWithSeller(productDetail.created_by, productDetail.id, '') : navigate(appRoutes.loginRoute)}>
                            <FontAwesomeIcon icon={faComment} className='neon-clr me-2' />
                            Chat with Seller
                          </button>
                        }
                        {hasOffer || productDetail.quantity == 0 ? null
                          :
                          <button className={`ms-2`} onClick={() => { setofferAmt(0); setOfferModel(true); }}>
                            <FontAwesomeIcon icon={faComment} className='neon-clr me-2' />
                            Send Offer
                          </button>
                        }
                      </div>
                    </div>
                    <p className="avg-response-time f14">Tags: <strong>{productDetail && productDetail.prepared_tags}</strong></p>
                  </div>
                </div>
              </div>
              <div className="card-cstm mb-4">
                <div className="card-body">
                  <h5 className="card-title"><FontAwesomeIcon icon={faList}></FontAwesomeIcon> Description</h5>
                  <ReadMoreComponent content={productDetail && productDetail.hasOwnProperty('description') ? productDetail.description : ''} maxLength={150} />
                  {/* {productDetail && productDetail.hasOwnProperty('description') ? <div className="desc-content" dangerouslySetInnerHTML={{ __html: productDetail.description }} /> : null} */}
                </div>
              </div>

              <div className="card-cstm mb-4">
                <div className="card-body">
                  <h5 className="card-title"><FontAwesomeIcon icon={faList}></FontAwesomeIcon> Specification</h5>
                  <div className="desc-content">
                    <div className="d-flex flex-wrap">
                      {/* <div className="col-12 col-md-4 item-specification mb-3">
                        <div className="item-specification-label">Item</div>
                        <div><h5>{productDetail.game}</h5></div>
                      </div> */}
                      <div className="col-12 col-md-4 item-specification mb-3">
                        <div className="item-specification-label">In Stock</div>
                        <div><h5>{productDetail && productDetail.quantity}</h5></div>
                      </div>
                      <div className="col-12 col-md-4 item-specification mb-3">
                        <div className="item-specification-label">Shipping Method</div>
                        <div><h5>{productDetail && productDetail.delivery_method == '1' ? 'Yes' : 'No'}</h5></div>
                      </div>
                      {
                        productDetail && productDetail.delivery_method == '1'
                          ?
                          <div className="col-12 col-md-4 item-specification mb-3">
                            <div className="item-specification-label">Shipping Price</div>
                            <div><h5>£{productDetail && productDetail.delivery_method == '1' ? parseFloat(productDetail.delivery_price).toFixed(2) : '0.00'}</h5></div>
                          </div>
                          :
                          ""
                      }
                      <div className="col-12 col-md-4 item-specification mb-3">
                        <div className="item-specification-label">Estimated delivery time</div>
                        <div><h5>
                          {
                            estimateDeliveryTime.filter((item) => item.id == productDetail.delivery_time).map((filterItem) => {
                              return filterItem.value;
                            })
                          }
                        </h5></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="card-cstm mb-4">
                <div className="card-body">
                  <h5 className="card-title"><FontAwesomeIcon icon={faList}></FontAwesomeIcon> Product Review ({reviews.length})</h5>
                  <div className="desc-content">
                    <ReviewRating reviews={reviews} />
                  </div>
                </div>
              </div> */}

            </div>
            <div className="col-lg-4 detail-right mb-md-4 mt-5">
              <div>
                <div className="card-cstm mb-4 offer-buy-sec mobile-bottom-fix">
                  <div className="card-body">

                    <div className="d-flex offer-info align-items-center">
                      <div className="offer-info-img flex-shrink-0"><img className="avatar48" src={productUser.display_user_image} alt="" title="" /></div>
                      <div className="offer-info-text">
                        <h6 className="m-0 f-bold"><a className="text-white" onClick={() => navigate(appRoutes.sellerProfileRoute + '/' + productUser.id)} href={undefined}><strong>{productUser.name}</strong></a></h6>
                        <div className="online-status active">
                          <span className="offer-info-ratting">{parseFloat(productUser.avg_rating).toFixed(1)} <FontAwesomeIcon icon={faStar}></FontAwesomeIcon></span>
                        </div>
                      </div>
                    </div>
                    <div className="offer-info-title">
                      {/* <h2 className="mb-3">
                      <ReadMoreComponent content={ productDetail && productDetail.hasOwnProperty('title')  ? productDetail.title : ''} maxLength={50} />
                      </h2> */}
                      <div className="d-flex justify-content-between">
                        <div className='h6 mb-2'>Price:</div>
                        <div className='price-text h5 mb-3' >{`£${productDetail && productDetail.price}`}</div>
                      </div>

                      <div className="d-flex justify-content-between">
                        <div className='h6 mb-2'>Shipping Price:</div>
                        <div className="price-text h5 mb-3">£{productDetail && productDetail.delivery_method == '1' ? parseFloat(productDetail.delivery_price).toFixed(2) : '0.00'}
                        </div>
                      </div>

                      <div className="d-flex justify-content-between">
                        <div className='h6 mb-2'>Total:</div>
                        <div className='price-text h5 mb-3'>£{productDetail && productDetail.delivery_method == '1' ? parseFloat(Number(productDetail.price) + Number(productDetail.delivery_price)).toFixed(2) : productDetail.price}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      {/* <div className="col px-2">
                      <div className="input-group cstm-qty align-items-center">
                        <span className="input-group-btn">
                          <button type="button" className="btn btn-number decr" onClick={() => setNumberOfItemAddedInCart(numberOfItemAddedInCart > 1 ? numberOfItemAddedInCart - 1 : 1)}><FontAwesomeIcon icon={faMinus}></FontAwesomeIcon></button>
                        </span>
                        <input type="text" name="numberOfItemAddedInCart" className="form-control input-number" value={numberOfItemAddedInCart} min="1" max="100" readOnly />
                        <span className="input-group-btn">
                          <button type="button" className="btn  btn-number incr" onClick={() => setNumberOfItemAddedInCart(numberOfItemAddedInCart < 100 ? numberOfItemAddedInCart + 1 : 100)}><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon></button>
                        </span>
                      </div>
                    </div> */}


                      <div className={`col ${productDetail && user != null && productDetail.created_by != undefined && productDetail.created_by != user.id && productDetail.quantity != '0' ? 'd-block' : 'd-none'}`}><button className="blue-btn w-100" type="button" onClick={() => navigate(appRoutes.checkoutRoute + '/' + productDetail.slug)}>Buy Now</button></div>

                      <div className={`col price-text sold-out blue-btn w-100 ${productDetail && productDetail.quantity === 0 ? 'd-block' : 'd-none'} `}><strong>{'Sold Out'}</strong></div>

                    </div>
                  </div>
                </div>
                {
                  productDetail && productDetail.hasOwnProperty('product_videos') && productDetail.product_videos.length
                    ?
                    <div className='watch-video-btn' onClick={() => videoSliderPopUpRef.current.handleShow()}>
                      <FontAwesomeIcon icon={faVideo} /> Watch Video
                    </div>
                    :
                    null
                }

              </div>
              <VideoSliderPopUp productDetail={productDetail} ref={videoSliderPopUpRef} />
            </div>
          </div>
        </div>
      </section>

      <section className="similar-products">
        <div className="container">
          <h2 className="mb-3">Similar Items You May Like</h2>
          <SimilarProducts products={similarProduct} />
        </div>
      </section>
    </>
  )
}