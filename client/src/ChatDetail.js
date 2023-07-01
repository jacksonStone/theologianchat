import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './App.css';
const formattedMessage = (message) => {
    return { __html: message.replace(/\n/g, "<br />") }
}
function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chatDetail, setChatDetail] = useState({ messages: [] });
    const [theologian, setTheologian] = useState({ name: '' });
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
      fetchChatDetail();
    }, [chatId]);

    const handleBack = () => {
      navigate('/'); // Goes back to the homepage
    }
    
    const fetchChatDetail = async () => {
      const [chatHistory, theologians] = await Promise.all([
        fetch("/api/chat/" + chatId).then((response) => response.json()),
        (theologian.name ? Promise.resolve([theologian]) : fetch("/api/theologians").then((response) => response.json()))
      ]);
      setChatDetail(chatHistory);
      setTheologian(theologians.find(theologian => theologian._id === chatHistory.theologianId));
    }

    const handleSend = () => {
      // Make a copy of the messages array, then add the new message to it
      const updatedChatDetail = {...chatDetail, messages: [...chatDetail.messages, {author: 'User', content: newMessage}]};
      setChatDetail(updatedChatDetail);

      // Then send the message
      fetch("/api/chat/" + chatId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      }).then(() => {
        setNewMessage('');
        // Refresh the chat detail to get any new messages
        fetchChatDetail();
      });
    }

    return (
        <div className="chat-container">
         <div className="header-container"> 
            <button onClick={handleBack} className="back-button">
              <span className="arrow-left"></span>
            </button>
            <h1 className="header-title">Chat with {theologian.name}</h1> {/* Add className */}
          </div>
          <div className="chat-content">
            {chatDetail.messages.map((message, i) => (
              <div key={i} className={`message-bubble ${message.author === 'user' ? 'user-message' : 'theologian-message'}`}>
                <div dangerouslySetInnerHTML={formattedMessage(message.content)} className="message-content"></div>
              </div>
            ))}
            <div className="message-input-area">
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="message-input" />
              <button onClick={handleSend} className="send-button">Send</button>
            </div>
          </div>
        </div>
      );
}

export default ChatDetail;