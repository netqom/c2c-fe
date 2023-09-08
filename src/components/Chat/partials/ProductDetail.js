import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import appRoutes from '../../../configs/AppRoutes';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import appSettings from "../../../configs/AppConfig";
import { useSelector } from "react-redux";

const ProductDetail = (props) => {
    const { chat_id, product, hasOffer, handleOfferModel } = props;
    const { user } = useSelector((state) => state.common);
    const navigate = useNavigate();

    return (
        <>
            <div className="d-flex align-items-center overflow-hidden ">
                <div className="chat-product-img me-2">
                    <img className="rounded-circle" src={product.id != undefined ? product.display_path !== '' ? product.display_path : appSettings.admin_backend_url + '/storage/users/user.png' : appSettings.admin_backend_url + '/storage/users/user.png'} alt="no-image" width="45" height="45" />
                </div>
                <div className="chat-product-info  text-truncate">
                    <h6 className="chat-product-title text-truncate fw-normal mb-1 text-truncate"><strong>Title :</strong> {product.title}</h6>
                    <h6 className="chat-product-price mb-0 fw-normal"><strong>Price :</strong> {product.price}</h6>
                </div>
            </div>
            <div className="chat-view-btn ms-auto d-flex flex-shrink-0">

                {
                    product.deleted_at
                        ?
                        <button className="btn btn-sm btn-danger" type="button">Not exist anymore</button>
                        :
                        product.quantity === 0
                            ?
                            <button className="btn btn-sm btn-danger" type="button">Sold out</button>
                            :
                            hasOffer && user.id != product.created_by
                                ?
                                <button className="btn btn-sm btn-success" type="button" onClick={() => navigate({ pathname: appRoutes.checkoutRoute + '/' + product.slug, search: '?chat_id=' + chat_id })}>Pay now</button>
                                :
                                null
                }

                {
                    hasOffer || user.id == product.created_by || product.quantity === 0
                        ?
                        null
                        :
                        <button type="button" className="align-items-center btn btn-primary btn-sm d-flex shrink:0 ms-2" onClick={() => handleOfferModel(true)}>
                            Send Offer <FontAwesomeIcon icon={faChevronRight} className='small ms-1' />
                        </button>
                }

                <button type="button" className="align-items-center btn btn-primary btn-sm d-flex shrink:0 ms-2" onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + product.slug)}>
                    View Product <FontAwesomeIcon icon={faChevronRight} className='small ms-1' />
                </button>

            </div>
            <div className="chat-sidePanel d-lg-none ps-2" onClick={props.openChatSideBar}>
                <a className="btn text-primary">
                    <FontAwesomeIcon icon={faMessage} />
                </a>
            </div>
        </>
    );
};

export default ProductDetail;
