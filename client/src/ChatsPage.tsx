// ChatPage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ChatPage.css';
import { fetchTheologians, fetchChats, deleteChat } from './api';
import { ChatPreview, Theologian, defaultTheologian } from './shared';
import { useAuth0 } from '@auth0/auth0-react';

function ChatsPage() {
  const [theologians, setTheologians] = useState<Theologian[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [accessToken, setAccessToken] = useState<string>('');
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    async function getAccessToken() {
      const accessToken = await getAccessTokenSilently();
      setAccessToken(accessToken);
    }
    getAccessToken();
  }, [getAccessTokenSilently]);
  useEffect(() => {
    if (!accessToken) return;
    fetchTheologians().then(setTheologians);
    fetchChats(accessToken).then(setChats);
  }, [accessToken]);

  const deleteChatThenFetch = (id: string) =>
    deleteChat(id, accessToken).then(() => fetchChats(accessToken).then(setChats));

  return (
    <div className="chats-page">
      <header className="header">
        <Link to="/create-chat" className="start-chat">
          Start a new chat
        </Link>
      </header>
      <div className="chat-list">
        {chats.map((chat) => {
          const theologian = theologians.find((t) => t._id === chat.theologianId) || defaultTheologian;
          return (
            <Link to={`/chat-history/${chat._id}`} className="chat-item" key={chat._id}>
              <div className="chat-thumbnail">{<img src={theologian.imageUrl} alt={theologian.name} />}</div>
              <div className="chat-preview">
                <div className="theologian-details">{`${theologian.name} - ${theologian.description}`}</div>
                <div className="message-content">{chat.firstMessage?.content || 'No messages yet'}</div>
              </div>
              <button
                className="delete-chat"
                onClick={(e) => {
                  e.preventDefault();
                  deleteChatThenFetch(chat._id);
                }}
              >
                X
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export default ChatsPage;