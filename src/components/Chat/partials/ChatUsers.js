import { ContentLoading } from '../../Common/ContentLoading';
import moment from 'moment';

const ChatUsers = (props) => {

    const { lastMsg, users, user, selectedChatId, selectChat, loading_chat_user } = props;

    return (

        loading_chat_user
            ?
            <ContentLoading />
            :
            <>
                {
                    users.length > 0
                        ?
                        users.map((item, index) => (

                            <div key={index} onClick={() => { selectChat(item.chat_id, item.product); }} className={`discussion ${item.chat_id == selectedChatId ? 'message-active' : ''} `} >
                                {/* {console.log(lastMsg, 'item', item)} */}
                                <div className="chat-pic">
                                    <img className="rounded-circle" src={item.product.display_path} alt="no-image" width="45" height="45" />
                                    <div className="online"></div>
                                </div>
                                <div className="desc-contact">
                                    <p className="name">{item.product.title}</p>
                                    <p className="name">{item.user.name}</p>
                                    <p className="message">
                                        {
                                            lastMsg != '' && selectedChatId == item.chat_id
                                                ?
                                                <>
                                                    <span>Last message: {moment(lastMsg).format('YYYY-MM-DD HH:mm:ss')}</span>
                                                </>
                                                :
                                                item.messages.length
                                                    ?
                                                    <>
                                                        <span>Last message: {moment(item.messages[0].created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                                                    </>
                                                    :
                                                    'No message'
                                        }
                                    </p>
                                </div>

                            </div>
                        ))
                        :
                        <div className='align-items-center d-flex flex-column h-100 justify-content-center p-4'>
                            <span className='text-white-50'>{`No chat avialable`}</span>
                        <div className=''>
                            <img src='/assets/images/no-chat-icon.png' style={{maxWidth: '140px'}}/>
                            </div>
                        </div>
                        
                }
            </>
    );
};

export default ChatUsers;
