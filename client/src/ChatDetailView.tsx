import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { ChatDetail, Theologian, defaultTheologian } from './shared';

const formattedMessage = (message: string) => {
  return { __html: message.replace(/\n/g, '<br />') };
};
const fetchChatDetail = async (
  chatId: string,
  setChatDetail: (chatDetail: ChatDetail) => void,
  setTheologian: (theologian: Theologian) => void,
) => {
  fetch('/api/chat/' + chatId)
    .then((response) => response.json())
    .then(async (chatDetail) => {
      return [await fetch('/api/theologians').then((response) => response.json()), chatDetail];
    })
    .then(([theologians, chatDetail]) => {
      setTheologian(theologians.find((t: Theologian) => t._id === chatDetail.theologianId));
      setChatDetail(chatDetail);
    });
};

// TODO:: Don't refecth Theologians if navigating from a different page.
function ChatDetailView() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [chatDetail, setChatDetail] = useState<ChatDetail>({
    messages: [],
    theologianId: defaultTheologian._id,
  });
  const [theologian, setTheologian] = useState<Theologian>(defaultTheologian);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    fetchChatDetail(chatId as string, setChatDetail, setTheologian);
  }, [chatId]);

  const handleBack = () => {
    navigate('/'); // Goes back to the homepage
  };

  const handleSend = () => {
    const updatedChatDetail = {
      ...chatDetail,
      messages: [...chatDetail.messages, { author: 'user', content: newMessage }],
    };
    setChatDetail(updatedChatDetail);
    setNewMessage('');

    fetch('/api/chat/' + chatId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: newMessage }),
    }).then(() => {
      fetchChatDetail(chatId as string, setChatDetail, setTheologian);
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
          <button onClick={handleSend} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatDetailView;
