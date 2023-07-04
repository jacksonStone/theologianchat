// ChatPage.js
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChatPage.css';
import { ChatPreview, Theologian, CreateChatResponse, defaultTheologian } from './shared';

const fetchChats = (): Promise<ChatPreview[]> => fetch('/api/chats').then((response) => response.json());
const fetchTheologians = (): Promise<Theologian[]> => fetch('/api/theologians').then((response) => response.json());
const deleteChat = (id: string) => fetch(`/api/chat/${id}`, { method: 'DELETE' });
const createChat = (selectedTheologian: string): Promise<CreateChatResponse> =>
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theologianId: selectedTheologian }),
  }).then((response) => response.json());

function ChatsPage() {
  const [theologians, setTheologians] = useState<Theologian[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedTheologian, setSelectedTheologian] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTheologians().then(setTheologians);
    fetchChats().then(setChats);
  }, []);

  const deleteChatThenFetch = (id: string) => deleteChat(id).then(() => fetchChats().then(setChats));
  const createThenNavigate = () =>
    createChat(selectedTheologian).then((newChat) => navigate(`/chat-history/${newChat.insertedId}`));

  return (
    <div className="chats-page">
      <header className="header">
        <select value={selectedTheologian} onChange={(e) => setSelectedTheologian(e.target.value)} className="dropdown">
          <option value="">Select a theologian...</option>
          {theologians.map((theologian) => (
            <option value={theologian._id} key={theologian._id}>
              {theologian.name}
            </option>
          ))}
        </select>
        <button onClick={createThenNavigate} disabled={!selectedTheologian} className="start-chat">
          Start a new chat
        </button>
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
