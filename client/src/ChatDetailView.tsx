import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { ChatDetail, Theologian, defaultTheologian } from './shared';
import { getChat, fetchTheologians, postToChat } from './api';
import { useAuth0 } from '@auth0/auth0-react';

const formattedMessage = (message: string) => {
  return { __html: message.replace(/\n/g, '<br />') };
};
const fetchChatDetail = async (
  chatId: string,
  setChatDetail: (chatDetail: ChatDetail) => void,
  setTheologian: (theologian: Theologian) => void,
  accessToken: string,
) => {
  return Promise.all([getChat(chatId, accessToken), fetchTheologians()]).then(([chatDetail, theologians]) => {
    setTheologian(theologians.find((t: Theologian) => t._id === chatDetail.theologianId) || defaultTheologian);
    setChatDetail(chatDetail);
  });
};

// TODO:: Don't refecth Theologians if navigating from a different page.
function ChatDetailView() {
  const { getAccessTokenSilently } = useAuth0();

  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [chatDetail, setChatDetail] = useState<ChatDetail>({
    messages: [],
    theologianId: defaultTheologian._id,
  });
  const [theologian, setTheologian] = useState<Theologian>(defaultTheologian);
  const [newMessage, setNewMessage] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');

  useEffect(() => {
    if (!accessToken) return;
    fetchChatDetail(chatId as string, setChatDetail, setTheologian, accessToken);
  }, [chatId, accessToken]);

  useEffect(() => {
    async function getAccessToken() {
      // const audience = process.env.REACT_APP_AUTH0_AUDIENCE as string;
      const accessToken = await getAccessTokenSilently();
      setAccessToken(accessToken);
    }
    getAccessToken();
  }, [getAccessTokenSilently]);

  const handleBack = () => {
    navigate('/chats'); // Goes back to the chats
  };

  const handleSend = () => {
    const updatedChatDetail = {
      ...chatDetail,
      messages: [...chatDetail.messages, { author: 'user', content: newMessage }],
    };
    setChatDetail(updatedChatDetail);
    setNewMessage('');

    postToChat(chatId || '', newMessage, accessToken).then(() => {
      fetchChatDetail(chatId as string, setChatDetail, setTheologian, accessToken);
    });
  };

  if (theologian === defaultTheologian) return <></>;

  return (
    <div className="chat-container">
      <div className="header-container">
        <button onClick={handleBack} className="back-button">
          <span className="arrow-left"></span>
        </button>
        <h1 className="header-title">Chat with {theologian.name}</h1>
      </div>
      <div className="chat-content">
        {chatDetail.messages.map((message, i) => (
          <div
            key={i}
            className={`message-bubble ${message.author === 'user' ? 'user-message' : 'theologian-message'}`}
          >
            <div dangerouslySetInnerHTML={formattedMessage(message.content)} className="message-content"></div>
          </div>
        ))}
        <div className="message-input-area">
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="message-input" />
          {chatDetail.messages.length < 8 ? (
            <button onClick={handleSend} className="send-button">
              Send
            </button>
          ) : (
            <div> Max messages reached. Try starting a new conversation</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatDetailView;
