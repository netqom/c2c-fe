import React, { useState, forwardRef, useImperativeHandle, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import { Rating } from 'react-simple-star-rating'
import { ContentLoading } from '../Common/ContentLoading';
import { callCommonAction } from '../../redux/Common/CommonReducer'
import { sendRequest } from '../../apis/APIs';
import appRoutes from '../../configs/AppRoutes';
import SocketContext from '../../apis/socket-context';


const ReviewRatingModal = forwardRef((props, ref) => {
    //console.log('props', props);
    //console.log('ref', ref);
    const [show, setShow] = useState(0);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [productId, setProductId] = useState(0);
    const [itemId, setItemId] = useState(0);
    const [orderId, setOrderId] = useState(0);
    const { user, loading, contentloading } = useSelector((state) => state.common);
    const [errorsInfo, setErrorsInfo] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const [productOwner,setProductOwner] = useState(0)
    // Catch Rating value
    const handleRating = (rate) => {
        setRating(rate)
    }

    const handleClose = () => { setTimeout(()=>{ setShow(false); },100) };
    const handleShow = (order_id, product_id, product_owner) => {setProductOwner(product_owner); setOrderId(order_id);setProductId(product_id);callReviewFormData(order_id, product_id);setShow(true);}; 

    useImperativeHandle(ref, () => {
        return {
            handleShow: handleShow,
        }
    });

    const callReviewFormData = async (order_id, product_id) => {
        try {
            setRating(0);
            setReview('');
            setItemId(0);
            dispatch(callCommonAction({ contentloading: true }));
            const res = await sendRequest(`/get-review-form-data`, 'GET', { order_id: order_id, product_id: product_id });
            if(res.data.data != undefined){
                setRating(res.data.data.rating);
                setReview(res.data.data.review);
                setItemId(res.data.data.id);
            }
            dispatch(callCommonAction({ contentloading: false }));
        } catch (error) {
            //console.log(error);
            dispatch(callCommonAction({ contentloading: false }));
            if(error.response.data.message === 'Unauthenticated.'){
                dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
                localStorage.clear();
                navigate(appRoutes.loginRoute);
            }
        }
    }

     /** OnChange Update Input Values */
     const handleChange = (e) => {
        setReview(e.target.value);
    }

    /** Validation implemented here */
    const checkFormIsValid = () => {
        const errors = {};
        var hasError = false;
        if(rating === 0){
            errors.rating = 'Please select rating.';
            hasError = true;
        }
        if(review === ''){
            errors.review = 'Please add review text.';
            hasError = true;
        }
        setErrorsInfo(errors);
        return hasError;
    }

    /** Form Submit Functionality Here */
    const updateReview = async (e) => {
        e.preventDefault();
        //console.log('checkFormIsValid', checkFormIsValid())
        if (!checkFormIsValid()) {
            try {
                dispatch(callCommonAction({ loading: true }));
                const formData = new FormData();
                formData.append('rating', rating);
                formData.append('review', review);
                formData.append('product_id', productId);
                formData.append('order_id', orderId);
                formData.append('item_id', itemId);
                await sendRequest(`/add-update-review-rating`, 'POST', formData);
                if(itemId === 0){
                    socket.emit("send_notification", [productOwner]);
                }
                dispatch(callCommonAction({ loading: false }));
                handleClose();
                props.reloadOrderList();
            } catch (error) {
                console.log(error);
                dispatch(callCommonAction({ loading: false }));
                if(error.response.data.message === 'Unauthenticated.'){
				    dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
				    localStorage.clear();
				    navigate(appRoutes.loginRoute);
				}
            }
        }
    }
    

    return (
        <>
            {contentloading ? <ContentLoading /> : 
                <Modal className='modal' show={show} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Review Rating</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <form className="" noValidate onSubmit={updateReview}>
                        <div className="">
                            <div className="mb-3">
                                <label className="form-label" htmlFor="rating">Select Rating </label><br />
                                <Rating className="text-center" onClick={handleRating} initialValue={rating} name="rating" id="rating" />
                            <br/> <span className='invalid-field'>{errorsInfo.rating}</span>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="review">Add Review </label>
                                <textarea name="review" id="review" className="form-control" row={4} onChange={(e) => handleChange(e)} defaultValue={review} />
                                <span className='invalid-field'>{errorsInfo.review}</span>
                            </div>
                            <div className="border-top"></div>
                            <div className="d-flex mt-2 mb-3 justify-content-center justify-content-md-end">
                                {loading ?
                                    <button type="button" className="btn btn-primary m-0 btn-sm">Wait.. <span className="spinner-border" role="status"></span></button>
                                :<button type="submit" className="btn btn-primary m-0 btn-sm">Save </button>
                                }    
                            </div>
                        </div>
                    </form>    
                    </Modal.Body>
                </Modal>
            }
        </>
    )
})
export default ReviewRatingModal;