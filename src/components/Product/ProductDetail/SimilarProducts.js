import { useNavigate } from 'react-router-dom';
import {  faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appRoutes from '../../../configs/AppRoutes';

const SimilarProducts = ((props) => {
    const {products} = props;
    const navigate = useNavigate();
    
    return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4" >
            {products.length > 0 ? 
                products.map((item) =>           
                    <div className="col" key={item.id}>
                            <div className="card flex-row flex-lg-column bg-transparent">
                                <div className="card-img flex-shrink-0 mb-3 me-3 me-lg-0" onClick={() => navigate('/'+appRoutes.productDetailRoute + '/' + item.slug)}>
                                    <a href={undefined}><img src={item.display_thumb_path} alt="" title="" /></a>
                                </div>
                                <div className="card-texts">
                                <div className="cat-name text-truncate"><a href={undefined} >{item.title}</a> </div>
                                <div className="price-text">£{parseFloat(item.price).toFixed(2)}</div>
                                <hr />
                                <div className="d-flex align-items-center">
                                    <div className='d-flex align-items-center text-truncate'>
                                    <div className='flex-shrink-0'><img className="avatar30" src={item.users.display_user_image} alt="" title="" /></div>
                                    <div className="pe-2 text-truncate card-person-name"><a onClick={() => navigate(appRoutes.sellerProfileRoute+'/'+item.users.id)} href={undefined}>{item.users.name}</a></div>
                                    </div>
                                    <div className="d-flex align-items-center flex-shrink-0">
                                    <div className="rating-text">
                                    {item.users.avg_rating} ({item.users.rating_count})<FontAwesomeIcon icon={faStar} />
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                )
                :''
            }         
        </div>
    )
})
export default SimilarProducts;