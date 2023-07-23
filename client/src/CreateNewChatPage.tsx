// CreateChatPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theologian } from './shared';
import { fetchTheologians, createChat } from './api';
import { useAuth0 } from '@auth0/auth0-react';

function CreateChatPage() {
  const [theologians, setTheologians] = useState<Theologian[]>([]);
  const [selectedTheologian, setSelectedTheologian] = useState<string>('');
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string>('');
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    fetchTheologians().then(setTheologians);
  }, []);

  useEffect(() => {
    async function getAccessToken() {
      const accessToken = await getAccessTokenSilently();
      setAccessToken(accessToken);
    }
    getAccessToken();
  }, [getAccessTokenSilently]);

  const createThenNavigate = () =>
    createChat(selectedTheologian, accessToken).then((newChat) => navigate(`/chat-history/${newChat.insertedId}`));

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
