import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatDetail from './ChatDetailView';
import Home from './Home';
import Signup from './Signup';
import Faq from './Faq';
import ChatsPage from './ChatsPage';
import CreateNewChatPage from './CreateNewChatPage';
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history';
function App() {
  return (
    <Router>
      <Auth0ProviderWithHistory>
        <Routes>
          <Route path="/chat-history/:chatId" element={<ChatDetail />} />
          <Route path="/create-chat" element={<CreateNewChatPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Auth0ProviderWithHistory>
    </Router>
  );
}

export default App;
