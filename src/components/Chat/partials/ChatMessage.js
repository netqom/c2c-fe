import React, { useState, useEffect, useRef } from 'react';
import MessageFile from './MessageFile';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark,  faComments, faEllipsisV,  faMoneyCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import appSettings from '../../../configs/AppConfig';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';


const ChatMessage = (props) => {
    const { product, offerModel, handleOfferModel, offerAmt, handleSubmitOffer, handleCountOffAmt, confirmBeforeReject, confirmBeforeAccept, retrieveMessage, chat_id, messages, user, current_page, scroolBottom, setScroolBottom, hasMore, deleteMyMessage } = props;
    const [mesageId, setMesageId] = useState('');
    const messagesEndRef = useRef(null);
    const messagesListRef = useRef(null);
    const { alert } = useSelector((state) => state.common)

    useEffect(() => {
        if (current_page === 1) {
            scrollToBottom()
        }
        if (current_page > 1) {
            document.getElementById(mesageId).focus();
        }
        if (scroolBottom) {
            scrollToBottom();
            setScroolBottom(false);
        }
    }, [messages]);


    /** Load More Data Into The Message Section */
    const loadMoreData = (chat_id, page) => {
        console.log('messagesListRef', messagesListRef)
        setMesageId(messagesListRef.current.firstChild.id);
        retrieveMessage(chat_id, page);
    }

    /** Scroll Down Function */
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
    }

    const counterOfferForm = () => {
        return (
            <Modal show={offerModel} onHide={() => handleOfferModel(false)}>
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
                    <Button className='btn btn-danger btn-sm' onClick={() => handleOfferModel(false)}><FontAwesomeIcon icon={faCircleXmark} /> Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <div className="messages-chat" >
            {/* {console.log(moment.tz.guess())} */}
            {
                hasMore ?
                    <p className="message-load-more">
                        <a href={undefined} onClick={() => loadMoreData(chat_id, parseInt(current_page) + parseInt(1))}>
                            <i className="fa fa-solid fa-chevron-up"></i>
                        </a>
                    </p>
                    : ''
            }

            {offerModel ? counterOfferForm() : null}
            {alert}

            {
                messages.length
                    ?
                    <div ref={messagesListRef} >
                        {
                            messages.map((item, index) => (
                                <div key={index} id={'message_' + item.id} tabIndex={0} className={`message align-items-start ${user.id == item.sender.id ? 'justify-content-end' : ''} `}>
                                    {/* Recieved Person Message Show Here*/}

                                    {
                                        user.id !== item.sender.id
                                            ?
                                            <div className="chat-pic">
                                                <img className="rounded-circle" src={` ${appSettings.admin_backend_url + '/storage/' + item.sender.image_path} `} alt="no-image" width="45" height="45" />
                                                <div className="online"></div>
                                            </div>
                                            :
                                            null
                                    }



                                    <div className="chat-txt">
                                        <div className={`${user.id === item.sender.id ? 'text-end' : ''}`}>
                                            <span className='name'>{item.sender.name}, <span className="time">{moment(new Date(item.created_at)).utc(true).fromNow()}</span></span>
                                        </div>
                                        <div className={`d-flex flex-column ${user.id === item.sender.id ? 'response' : ''} `}>
                                            {
                                                item.content != ''
                                                    ?
                                                    item.has_offer === 1 && item.offer_response === 0 && user.id != item.sender.id
                                                        ?
                                                        <>
                                                            <div className="bg-purple-light offer-chat-sec p-2 rounded-1 w-auto">
                                                                <div className="d-flex gap-2 justify-content-center">
                                                                    <button type="button" className="btn btn-sm bg-success fw-bold small fs12  text-uppercase text-white" onClick={() => confirmBeforeAccept(item.id, item.chat_id)}>Accept</button>
                                                                    <button type="button" className="btn btn-sm bg-danger fw-bold small fs12  text-uppercase text-white" onClick={() => confirmBeforeReject(item.id, item.chat_id)}>Reject</button>
                                                                    <button type="button" className="btn btn-sm bg-info fw-bold small fs12  text-uppercase text-white" onClick={() => handleOfferModel(true)}>Counter Offer</button>
                                                                </div>
                                                                <p className="offer-chat-text text-center text-white mt-2 small mb-0">{`Offered £${parseFloat(item.offer_amt).toFixed(2)} for this product`}</p>
                                                            </div>
                                                        </>
                                                        :
                                                        <>
                                                            <p className="text">{item.content}</p>
                                                        </>
                                                    :
                                                    null
                                            }

                                            {item.messagefiles.length > 0 ?
                                                <MessageFile file={item.messagefiles[0]} />
                                                : ''
                                            }
                                        </div>
                                    </div>
                                    {/* Sender Person Message Show Here*/}
                                    {
                                        user.id === item.sender.id
                                            ?
                                            <>
                                                <div className="chat-pic">
                                                    <img className="rounded-circle" src={` ${appSettings.admin_backend_url + '/storage/' + item.sender.image_path} `} alt="no-image" width="45" height="45" />
                                                    <div className="online"></div>
                                                </div>
                                                <div className='chat-actions'>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                            <FontAwesomeIcon icon={faEllipsisV} className='small ms-2' />
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item href={undefined} onClick={() => deleteMyMessage(item.id)}>Delete</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                            </>
                                            :
                                            null
                                    }
                                </div>
                            ))
                        }

                    </div>
                    :
                    <p className='text-center text-white h-100 d-flex align-items-center flex-column justify-content-center'>
                        <FontAwesomeIcon icon={faComments} className='d-block h1 mb-2 opacity-50' />
                        <span>No Message</span>
                    </p>
            }
            <div ref={messagesEndRef}></div>
        </div>
    );
};

export default ChatMessage;