import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
/* import './Chat.css'; */
import { useDispatch, useSelector } from "react-redux";
import { callCommonAction } from "../../redux/Common/CommonReducer";
import { sendRequest } from "../../apis/APIs";
import { toast } from "react-toastify";
import { CheckUnAuthorized } from "../Common/CheckUnAuthorized";
import ChatUsers from "./partials/ChatUsers";
import ProductDetail from "./partials/ProductDetail";
import ChatMessage from "./partials/ChatMessage";
import appRoutes from "../../configs/AppRoutes";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faClose, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SocketContext from "../../apis/socket-context";
import Alerts from '../../common/Alerts/Alerts';
import { Helmet } from "react-helmet";
import { AppRoutes } from "../../configs";

const Chatbox = () => {
  const { user, loading_chat_user } = useSelector((state) => state.common);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasOffer, setHasOffer] = useState(false);
  const [scroolBottom, setScroolBottom] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [chatWithUserList, setChatWithUserList] = useState([]);
  const inputMsgRef = useRef(null);
  const [lastMsg, setLastMsg] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [selectedChatProduct, setSelectedChatProduct] = useState({});
  const [typingDetail, setTypingDetail] = useState({
    typingIndicator: false,
    typingSenderId: 0,
    typingSenderName: "",
  });
  const socket = useContext(SocketContext);
  const [filename, setFileName] = useState([]);
  const [files, setFiles] = useState([]);
  const [isFocoused, setIsFocoused] = useState(true);
  const { chat_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputFile = useRef(null);
  const [toggleSideBar, setToggleSideBar] = useState(false);
  const [offerModel, setOfferModel] = useState(false);
  const handleOfferModel = (status) => { setOfferModel(status); };
  const [offerAmt, setofferAmt] = useState(0);
  let offerResponse = 0;

  useEffect(() => {
    /** Listening the event from node server and send to laravel backend */
    socket.on("message_recived", function (res) {
      console.log("message_recived", res);
      if (res.show_pay_and_hide_send_offer) {
        setHasOffer(1)
      }
      if (res.offer_amt != '0') { // This was added just for if buyer send offer more than 1 time then reciever side only show latest offer
        retrieveMessage(res.chat_id, 1)
      }
      setLastMsg((list) => res.created_at);
      if (inputFile.current != null) {
        inputFile.current.value = "";
      }
      setMessageList((list) => [...list, res]);
      setScroolBottom(true);
    });

    /** Listening the event from node server to show typing indicator */
    socket.on("typing_start", (data) => {
      setTypingDetail({
        ...typingDetail,
        typingIndicator: true,
        typingSenderId: data.sender_id,
        typingSenderName: data.sender_name,
      });
    });

    /** Listening the event from node server to hide typing indicator */
    socket.on("typing_end", () => {
      setTypingDetail({ ...typingDetail, typingIndicator: false });
    });
  }, [socket]);


  useEffect(() => {
    //console.log('useeffect chat_id', chat_id)
    if (isFocoused) {
      getChatUserList(chat_id);
    }
    // console.log(`run again chat.js`)
  }, [isFocoused]);

  /** Retrieve Chat Users For Particular Chat*/
  const getChatUserList = async () => {
    try {
      dispatch(
        callCommonAction({ loading_chat_user: true, chatVisibility: true })
      );
      const res = await sendRequest("/get-chat-user-list", "GET");
      //console.log('getChatUserList', res)
      if (res.data.status) {
        setChatWithUserList(res.data.data);
        if (chat_id !== undefined) {
          var selected_product = res.data.data.filter(
            (item) => chat_id === item.chat_id
          );
          //rearrang Array
          selectChat(chat_id, selected_product[0].product);
          let prpareParamForRearrangeArray = {
            chat_id: chat_id,
            id: selected_product[0].id,
            product: selected_product[0].product,
          };
          rearrangeArray(prpareParamForRearrangeArray, 0, false, res.data.data);
        }
        setIsFocoused(false);
      }
      dispatch(callCommonAction({ loading_chat_user: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading_chat_user: false }));
      CheckUnAuthorized({
        error: error,
        dispatch: dispatch,
        navigate: navigate,
        callCommonAction: callCommonAction,
      });
    }
  };

  const selectChat = (new_chat_id, selected_product) => {
    setToggleSideBar(!toggleSideBar)
    if (new_chat_id !== chat_id) {
      navigate(
        appRoutes.authPrfixRoute + "/" + appRoutes.chatRoute + "/" + new_chat_id
      );
    }
    //emit event to join user in chat room
    socket.emit("join", { chat_id: new_chat_id });
    setSelectedChatId(String(new_chat_id));
    setSelectedChatProduct(selected_product);
    retrieveMessage(new_chat_id, 1);
  };

  /** Retrieve Message On Click Particular Chat*/
  const retrieveMessage = async (chat_id, page) => {

    try {
      console.log('function retrieveMessage call')
      dispatch(callCommonAction({ loading: true, chatVisibility: true }));
      setCurrentPage(page);
      const message_filter = { chat_id: chat_id, page: page };
      //console.log('message_filter', message_filter)
      socket.emit("get_message", message_filter, function (res, has_more, has_offer) {
        console.log('has_offer => ', has_offer);
        let new_message = res.reverse();
        if (parseInt(page) === 1) {
          setMessageList(new_message);
        } else {
          setMessageList([...new_message, ...messageList]);
        }
        setHasMore(has_more);
        setHasOffer(has_offer);
      });
      dispatch(callCommonAction({ loading: false }));
    } catch (error) {
      dispatch(callCommonAction({ loading: false, chatVisibility: false }));
    }
  };

  /** Send Message to server first*/
  const sendNewMessage = async () => {
    if (socket.id == undefined) {
      // console.log('if', socket.id)
      toast.error("Socket does not conneted yet.");
    }
    // console.log('scoket.id', socket.id)

    if (inputMsgRef.current.value === "" && files.length === 0) {
      toast.error("Please add some text or select a file to send a message.");
      return false;
    }
    dispatch(callCommonAction({ loading: true }));
    let users = [];
    let file = {};
    chatWithUserList.map((chat) => {
      if (chat.chat_id == selectedChatId) {
        users.push(chat.user.id);
      }
    });

    if (files.length > 0) {
      file.name = files[0].name;
      file.size = files[0].size;
      file.type = files[0].type;
      file.buffer = files[0];
    }
    const messageData = {
      content: inputMsgRef.current.value,
      sender_id: user.id,
      chat_id: selectedChatId,
      notify_users: users,
      file_data: file,
      offer_amt: offerAmt,
      offer_response: offerResponse,
      product_id: selectedChatProduct.id
    };
    // console.log('send messageData', messageData)
    socket.emit("send_message", messageData);
    dispatch(callCommonAction({ loading: false }));

    inputMsgRef.current.value = null;
    inputMsgRef.current.focus();

    setFileName([]);
    setFiles([]);
  };

  /**Start And Pause Indicator Fire From Here */
  const callTypingIndicator = (e) => {
    // setInputMsg(e.target.value);
    setTypingDetail({ ...typingDetail, typingIndicator: true });
    socket.emit("typing_start", {
      chat_id: selectedChatId,
      sender_id: user.id,
      sender_name: user.name,
    });
    setTimeout(() => {
      socket.emit("typing_end", {
        chat_id: selectedChatId,
        sender_id: user.id,
        sender_name: user.name,
      });
      setTypingDetail({ ...typingDetail, typingIndicator: false });
    }, 3000);
  };

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

  /** Delete Message  */
  const deleteMyMessage = (messageId) => {
    socket.emit("delete_message", messageId, (response) => {
      if (response.isDeleted) {
        const filteredPeople = messageList.filter(
          (item) => item.id !== messageId
        );
        toast.success("Message deleted successfully.");
        setMessageList(filteredPeople);
      }
    });
  };

  /** Search Functionality Implemented Here */
  const searchHandler = (e) => {
    setSearchValue(e.target.value);
    const data = chatWithUserList.filter((item) =>
      item.user.name.includes(e.target.value)
    );
    setSearchResult(data);
  };

  /** Array Rearrange According To Selected From Search Result */
  const rearrangeArray = (currentItem, newIndex, check = false, data) => {
    let arr = chatWithUserList.length ? chatWithUserList : data;
    let oldIndex = arr
      .map((item, index) => {
        if (item.id == currentItem.id) {
          return index;
        }
        return null;
      })
      .filter((ele) => ele != null);
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    setChatWithUserList(arr);
    if (check) {
      selectChat(currentItem.chat_id, currentItem.product);
    }
  };

  /** On Click On Enter Button Send Message */
  const handleKeyPress = async (event) => {
    if (event.key === "Enter" && event.shiftKey == false) {
      event.preventDefault();
      await sendNewMessage();
    }
  };


  /*********************Send Offer Section Start************************ */
  /** Confirmation before Accept */
  const confirmBeforeAccept = (selected_id, chat_id) => {
    let title = 'Are you sure you want to accept this offer?';
    const custom = Alerts.confirmationPopup(selected_id, acceptOffer, title, chat_id);
    dispatch(callCommonAction({ alert: custom }));
  }

  /** Accepted Offer Method */
  const acceptOffer = async (itemId, chat_id) => {
    dispatch(callCommonAction({ alert: null }));
    if (itemId) {
      offerResponse = 1;
      inputMsgRef.current.value = `Congratulations! Deal has been completed`;
      await sendNewMessage();
      await retrieveMessage(chat_id, 1)

    }
  }

  /** Confirmation before Reject */
  const confirmBeforeReject = (selected_id, chat_id) => {
    let title = 'Are you sure you want to reject this offer?';
    const custom = Alerts.confirmationPopup(selected_id, rejectOffer, title, chat_id);
    dispatch(callCommonAction({ alert: custom }));
  }

  /** Rejected Offer Method */
  const rejectOffer = async (itemId, chat_id) => {
    dispatch(callCommonAction({ alert: null }));
    if (itemId) {
      setofferAmt(0)
      offerResponse = 2;
      inputMsgRef.current.value = `Offer has been rejected`;
      await sendNewMessage();
      await retrieveMessage(chat_id, 1)
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

  const handleSubmitOffer = async () => {
    if (parseFloat(offerAmt) === 0 || offerAmt == '') {
      toast.error("Please enter valid amount");
    } else {
      inputMsgRef.current.value = `Offered £${parseFloat(offerAmt).toFixed(2)} for this product`
      await sendNewMessage('chat_id', chat_id);
      console.log()
      await retrieveMessage(chat_id, 1)
      setofferAmt(0);
      setOfferModel(false)
    }
  }
  /*********************End Send Offer Section************************ */

  return (
    <div className="content-wrapper" style={{ backgroundImage: "url(" + "/assets/images/chat-bg.png" + ")" }} >
      {/* {console.log( navigate(AppRoutes.checkoutRoute))} */}
      <Helmet>
        <title>Alium | Chat Page</title>
        <meta name="description" content="Chat Page Description Goes Here" />
        <meta name="keywords" content="Game, Entertainment, Movies" />
      </Helmet>
      <div className="container">
        <div className="row chat-wrapper">
          <section
            className={`discussions collapse ${toggleSideBar ? "open" : ""}`}
            id="chatside"
          >
            <div className="discussion search">
              <span className="close" onClick={() => setToggleSideBar(!toggleSideBar)}>
                <FontAwesomeIcon icon={faClose} />
              </span>
              <div className="searchbar">
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => searchHandler(e)}
                />
                <div className="search-btn">
                  <i className="fa fa-search" aria-hidden="true"></i>
                </div>
                <div
                  className={`search-list ${searchValue != "" ? null : "d-none"
                    } `}
                  onMouseLeave={() => setSearchValue("")}
                >
                  {searchResult.length ? (
                    searchResult.map((item, index) => (
                      <div
                        className="search-list-items"
                        key={index}
                        onClick={() => {
                          rearrangeArray(item, 0, true, chatWithUserList);
                          setSearchValue("");
                        }}
                      >
                        <div className="chat-pic">
                          <img
                            className="rounded-circle"
                            src={item.product.display_path}
                            alt="no-image"
                            width="45"
                            height="45"
                          />
                        </div>
                        <div className="desc-contact">
                          <p className="name">{item.user.name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Result Not Found</p>
                  )}
                </div>
              </div>
            </div>
            <div className="scroll-chat-list">
              <ChatUsers
                lastMsg={lastMsg}
                selectChat={selectChat}
                users={chatWithUserList}
                user={user}
                selectedChatId={selectedChatId}
                loading_chat_user={loading_chat_user}
              />
            </div>
          </section>
          <section className="chat">
            {selectedChatId !== "" ? (
              <>
                <div className="header-chat d-flex px-3">
                  <ProductDetail
                    product={selectedChatProduct}
                    hasOffer={hasOffer}
                    handleOfferModel={handleOfferModel}
                    openChatSideBar={() => setToggleSideBar(!toggleSideBar)}
                    chat_id={chat_id}
                  />
                </div>

                <ChatMessage

                  /**This Params For Only Offer Section */

                  confirmBeforeAccept={confirmBeforeAccept}
                  confirmBeforeReject={confirmBeforeReject}
                  offerAmt={offerAmt}
                  handleCountOffAmt={handleCountOffAmt}
                  handleSubmitOffer={handleSubmitOffer}
                  handleOfferModel={handleOfferModel}
                  offerModel={offerModel}
                  product={selectedChatProduct}
                  /**End Offer Section */

                  deleteMyMessage={deleteMyMessage}
                  retrieveMessage={retrieveMessage}
                  chat_id={selectedChatId}
                  messages={messageList}
                  user={user}
                  current_page={currentPage}
                  scroolBottom={scroolBottom}
                  setScroolBottom={setScroolBottom}
                  hasMore={hasMore}

                />

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
                  <div>
                    {" "}
                    {typingDetail.typingSenderId != 0 &&
                      typingDetail.typingSenderId != user.id &&
                      typingDetail.typingIndicator ? (
                      <div className="typing-ellips">{`${typingDetail.typingSenderName} is typing `}</div>
                    ) : null}{" "}
                  </div>

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
                        id="file"
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
                      onChange={(e) => {
                        callTypingIndicator(e);
                      }}
                    ></textarea>
                    <span className="msg-send" onClick={sendNewMessage}>
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-message-container">
                <div className="img-box">
                  <img src="/assets/images/new-no-message1.png" />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
