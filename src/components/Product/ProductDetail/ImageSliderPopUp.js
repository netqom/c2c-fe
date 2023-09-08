import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Modal from 'react-bootstrap/Modal';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

const ImageSliderPopUp = forwardRef((props, ref) => {
    const [show, setShow] = useState(0);

    const handleClose = () => { setTimeout(() => { setShow(false); }, 100) };
    const handleShow = () => { 
        setShow(true)
    };

    useImperativeHandle(ref, () => {
        return {
            handleShow: handleShow,
        }
    });



    return (
        <>
            <Modal className={`detail-slider ${props.isVideo ? 'video-wrap' : ''}`} show={show} onHide={handleClose} backdropClassName="custom-backdrop-class" >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body className='p-0'>
                        <Carousel showThumbs={false} dynamicHeight={true} autoPlay={true} selectedItem={props.selectedIndex} >
                            {
                                props.productDetail && props.productDetail.hasOwnProperty('product_images') && props.productDetail.product_images.length
                                    ?
                                    props.productDetail.product_images.map((item, inx) => (
                                        <div index={inx} key={inx}>
                                            <img src={item.url} />
                                        </div>
                                    ))
                                    :
                                    null
                            }
                        </Carousel>
                </Modal.Body>
            </Modal>
        </>
    )
})
export default ImageSliderPopUp;