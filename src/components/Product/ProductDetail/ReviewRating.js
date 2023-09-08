import {  faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Moment from 'moment'


const ReviewRating = ((props) => {
    const {reviews} = props;

    const prepareRatingHtml = (ratings) => {
        return (
            <>
                {(() => {
                    const arr = [];
                    for (let i = 0; i < ratings; i++) {
                        arr.push(
                            <FontAwesomeIcon icon={faStar} className='me-1 neon-clr' key={i} />
                        );
                    }
                    return arr;
                })()}
            </>
        )
    }

    return (
        <>           
            {reviews.length > 0 ?
                reviews.map((item) => 
                <div className="col-12 mb-3" key={item.id}>
                    <div className="seller-reviews_review-box p-3" >
                    <div className="seller-reviews_review-info-wrapper d-flex mb-2">
                        <div className="seller-reviews_review-avatar flex-shrink-0">
                        <img className="avatar48" src={item.user.display_user_image} alt="Bk**gy" /></div>
                        <div className="seller-reviews_review-info-container">
                        <div>
                            <h6 className="mb-1">{item.user.name}</h6>
                        </div>
                        <div className="d-flex align-items-center flex-wrap seller-reviews_review-rating-wrapper">
                            <div className="me-2 seller-reviews_review-rate">
                                {prepareRatingHtml(item.rating)}
                            </div>
                            <div className="seller-reviews_time">{Moment(item.created_at).format('MMM DD, yyyy')}</div>
                        </div>
                        </div>
                    </div>
                    <div className="seller-reviews_review-text">
                        <div className="body-p3">{item.review}</div>
                    </div>
                    </div>
                </div>
                )
            : 
                    <div className="seller-reviews_review-text">
                        <div className="body-p3">No Review Found</div>
                    </div>
            }
        </>
    )
})
export default ReviewRating;