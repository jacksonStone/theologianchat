// CreateChatPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theologian, fetchTheologians, createChat } from './shared';

function CreateChatPage() {
  const [theologians, setTheologians] = useState<Theologian[]>([]);
  const [selectedTheologian, setSelectedTheologian] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTheologians().then(setTheologians);
  }, []);

  const createThenNavigate = () =>
    createChat(selectedTheologian).then((newChat) => navigate(`/chat-history/${newChat.insertedId}`));

  return (
    <div className="create-chat-page">
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
    </div>
  );
}
export default CreateChatPage;
