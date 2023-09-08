import React, { useEffect, useRef, useState } from 'react';
import { faComments, faTicket, faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { callCommonAction } from '../../redux/Common/CommonReducer';
import moment from 'moment';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { sendRequest } from '../../apis/APIs';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import { useNavigate, useParams } from 'react-router-dom';
import appSettings from '../../configs/AppConfig';
import appRoutes from '../../configs/AppRoutes';



const TicketDetailPage = () => {
    const { unique_ticket } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [filter, setFilter] = useState({ search_string: '' })
    const [chatMessage, setChatMessage] = useState([]);
    const [product, setProduct] = useState([]);
    const [paginationData, setPaginationData] = useState({ perpage: 10, page: 1, totalCount: 0, hasMore: true });
    const { user, loading } = useSelector((state) => state.common);
    const inputFile = useRef(null);
    const inputMsgRef = useRef(null);
    const [filename, setFileName] = useState([]);
    const [files, setFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const [messageId, setMessageId] = useState('');
    const messagesListRef = useRef(null);

    useEffect(() => {
        getChatToRelatedTicket()
        if (inputFile.current != null) {
            inputFile.current.value = "";
        }

        //Implementing the setInterval method
        const interval = setInterval(() => {
            console.log('interval', interval)
            if (paginationData.page == '1') {
                getChatToRelatedTicket()
            } else {
                setPaginationData({ perpage: 10, page: 1, totalCount: 0, hasMore: true })
            }
        }, 60000 * 5);

        //Clearing the interval
        return () => clearInterval(interval);

    }, [paginationData.page]);


    const getChatToRelatedTicket = async () => {
        try {
            let body = { pagination: paginationData, query: { search_string: filter.search_string, unique_ticket: unique_ticket } };
            const res = await sendRequest(`/get-chat-for-ticket`, 'POST', body);

            if (res.data.status == false) {
                navigate(appRoutes.authPrfixRoute + '/' + appRoutes.helpCenterRoute);
              }
            if (parseInt(paginationData.page) === 1) {
                setChatMessage(res.data.data.reverse());
                setProduct(res.data.support_ticket.product);
                // This timeout for first render then scrollToBottom
                setTimeout(() => { scrollToBottom() }, 150)
            } else {
                setChatMessage([...res.data.data.reverse(), ...chatMessage]);
                // This timeout for first render then focous
                setTimeout(() => { document.getElementById(messageId).focus(); }, 150);
            }
            if (paginationData.page >= res.data.meta.pages) {
                setPaginationData({ ...paginationData, totalCount: res.data.meta.total, hasMore: false })
            } else {
                setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
            }

        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }

    const prepareChatMessage = () => {
        return chatMessage.map((item, index) => (
            <div key={index} id={'message_' + item.id} tabIndex={0} className={`message align-items-start ${user.id == item.sender_id ? 'justify-content-end' : ''} `}>

                {
                    <div className="chat-pic">
                        <img className="rounded-circle" src={item.sender.display_user_image} alt="no-image" width="45" height="45" />
                        <div className="online"></div>
                    </div>
                }

                <div className="chat-txt">
                    <div className={`${user.id === item.sender_id ? 'title-txt text-end' : ''}`}>
                        <span className='name'>{item.sender.name}, <span className="time">{moment(new Date(item.created_at)).fromNow()}</span></span>
                    </div>
                    <div className={`d-flex flex-column ${user.id === item.sender_id ? 'response' : ''} `}>
                        {
                            item.message ?
                                <p className="text"> {item.message}</p>
                                :
                                null
                        }

                        {
                            item.support_ticket_file
                                ?
                                <div className="attachetment-files mb-3" onClick={() => window.open(appSettings.admin_backend_url + '/storage/' + item.support_ticket_file.file_path, "_blank", 'noopener,noreferrer')}>
                                    <div>
                                        <img className="rounded-1" src={appSettings.admin_backend_url + '/storage/' + item.support_ticket_file.file_path} alt="file" height="50px;" width="50px;" />
                                    </div>
                                </div>
                                :
                                ''
                        }
                    </div>
                </div>
            </div>
        ))
    }


    //when delete image button clicked
    const deleteImage = () => {
        filename.splice(0, 1);
        setFileName([...filename]);
        //update the upload array element
        files.splice(0, 1);
        setFiles([...files]);
    };

    //when user select an image
    const onChangeFile = async (event) => {
        if (files.length > 0) {
            toast.error(
                "Only one file is allowed at a time previous file will be removed."
            );
            deleteImage();
            //return false;
        }
        var files_object = event.target.files;
        if (files_object.length === 0) {
            toast.error("Please select a valid image.");
            return false;
        }

        var current_file = files_object[0];
        const fileSizeKiloBytes = current_file.size / 1024;
        if (fileSizeKiloBytes > 5120) {
            toast.error("File size is greater than maximum limit 5MB.");
            return false;
        }
        if (!current_file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
            toast.error("Select file format is not allowed");
            return false;
        }
        setFileName((filename) => [...filename, current_file.name]);
        setFiles((files) => [...files, current_file]);
    };

    /** On Click On Enter Button Send Message */
    const handleKeyPress = async (event) => {
        if (event.key === "Enter" && event.shiftKey == false) {
            event.preventDefault();
            await sendNewMessage();
        }
    };



    /** Send Message to server first*/
    const sendNewMessage = async () => {
        // console.log('scoket.id', socket.id)
        console.log("files:",files);
        console.log("length:",files.length);
        if (inputMsgRef.current.value === "" && files.length === 0) {
            toast.error("Please add some text or select a file to send a message.");
            return false;
        }

        const fileInput = document.getElementById('fileupload');
        let formData = new FormData()
        console.log('fileInput', fileInput.files)
        formData.append('message', inputMsgRef.current.value);
        formData.append('unique_ticket', unique_ticket);
        for (let i = 0; i < fileInput.files.length; i++) {
            if(files.length > 0){
                formData.append(`file[${i}]`, fileInput.files[i]);
            }
        }

        try {
            dispatch(callCommonAction({ loading: true }));
            const res = await sendRequest(`/send-message`, 'POST', formData);
            if (res.data.status) {
                if (paginationData.page == '1') {
                    getChatToRelatedTicket()
                } else {
                    setPaginationData({ perpage: 10, page: 1, totalCount: 0, hasMore: true })     // Get latest data  after send message it act like call api
                }
            }
            dispatch(callCommonAction({ loading: false }));
            inputMsgRef.current.value = null;
            inputMsgRef.current.focus();

            setFileName([]);
            setFiles([]);
        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }


    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
    }

    const loadMoreData = () => {
        setMessageId(messagesListRef.current.firstChild.id);
        setPaginationData({ ...paginationData, page: (paginationData.page + 1) })
        console.log('messagesListRef', messagesListRef)
    }

    return (
        <div className="content-wrapper">
            {/* {console.log('paginationData', paginationData)} */}
            <div className='container'>
                <div className='col-12 mb-2'>
                    <div className="card shadow">
                        <div className="card-body p-xl-4">
                            <div className='row'>
                                <div className='col-12'>
                                    <div className="d-flex justify-content-between">
                                        <h6 className="m-0 text-primary"><FontAwesomeIcon icon={faTicket} /> Ticket Thread</h6>
                                        <button type="button" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.helpCenterRoute)} className="btn btn-primary m-0 btn-sm">Back to List </button>
                                    </div>
                                    <hr />
                                </div>
                                {
                                    product != null
                                        ?
                                        <div className='row mb-3 mt-2 chat-info-text mw-1000 mx-auto text-md-center justify-content-between'>
                                            <div className='col-md-4'><h6>Product Name: <span className='neon-clr cursor-pointer d-block fs14 mt-1' onClick={() => navigate('/'+ appRoutes.productDetailRoute +'/'+ product.slug)} >{product.title}</span></h6></div>
                                            <div className='col-md-4 text-md-center'><h6>Price: <span className='neon-clr cursor-pointer d-block fs14 mt-1' onClick={() => navigate('/'+ appRoutes.productDetailRoute +'/'+ product.slug)}>${product.price}</span></h6></div>
                                            <div className='col-md-4 text-md-end'><h6>Owner Name: <span className='neon-clr cursor-pointer d-block fs14 mt-1' onClick={() => navigate('/'+ appRoutes.productDetailRoute +'/'+ product.slug)} >{product?.users?.name}</span></h6></div>
                                        </div>
                                        :
                                        ''
                                }

                                <div className='chat-wrapper'>
                                    <section className="chat mw-1000 mx-auto w-100" style={{ borderLeft: '1px solid #1d4d9d' }}>
                                        {
                                            loading ?
                                                <div className='chat-loader'>
                                                    <img src="/assets/images/spinner.gif" alt="" title="" />
                                                </div>
                                                :
                                                null
                                        }
                                        <div className="messages-chat combined-chat">

                                            {
                                                paginationData.hasMore ?
                                                    <p className="message-load-more" style={{ marginTop: '-11px' }}>
                                                        <a className='fs14 small text-white' href={undefined} onClick={() => loadMoreData()}>Load More...</a>
                                                    </p>
                                                    : ''
                                            }
                                            <div ref={messagesListRef}>
                                                {
                                                    chatMessage.length > 0
                                                        ?
                                                        prepareChatMessage()
                                                        :
                                                        <p className='text-center text-white h-100 d-flex align-items-center flex-column justify-content-center'>
                                                            <FontAwesomeIcon icon={faComments} className='d-block h1 mb-2 opacity-50' />
                                                            <span>No Message</span>
                                                        </p>
                                                }

                                            </div>


                                            <div ref={messagesEndRef}></div>

                                        </div>

                                        <div className="footer-chat">
                                            {(filename || []).map((file, index) => (
                                                <div
                                                    className="align-items-center d-flex justify-content-between mb-3 p-2 rounded-2 attached-file-wrap"
                                                    key={file}
                                                >
                                                    <div className=" uploaded-attachment" key={index}>
                                                        <h6 className="attachment-name">
                                                            {" "}
                                                            {file.length > 20 ? file.slice(0, 20) : file}
                                                        </h6>
                                                        <img
                                                            src={URL.createObjectURL(files[index])}
                                                            height={40}
                                                            width={40}
                                                        />
                                                        <i
                                                            className="fa fa-times"
                                                            aria-hidden="true"
                                                            data-id={index}
                                                            data-type="local"
                                                            onClick={(e) => deleteImage(e)}
                                                        ></i>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="d-flex align-items-center">
                                                <span className="attach-btn">
                                                    <FontAwesomeIcon
                                                        icon={faPaperclip}
                                                        onClick={() => {
                                                            inputFile.current.click();
                                                        }}
                                                    />
                                                    <input
                                                        type="file"
                                                        id="fileupload"
                                                        ref={inputFile}
                                                        style={{ display: "none" }}
                                                        onChange={(e) => onChangeFile(e)}
                                                    />
                                                </span>
                                                <textarea
                                                    ref={inputMsgRef}
                                                    row="3"
                                                    cols="40"
                                                    onKeyDown={handleKeyPress}
                                                    className="write-message"
                                                    placeholder="Type your message here"
                                                ></textarea>
                                                <span className="msg-send" onClick={() => { sendNewMessage() }}>
                                                    <FontAwesomeIcon icon={faPaperPlane} />
                                                </span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TicketDetailPage;
