import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatDetail from './ChatDetailView';
import Home from './Home';
import Faq from './Faq';
import ChatsPage from './ChatsPage';
import CreateNewChatPage from './CreateNewChatPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/chat-history/:chatId" element={<ChatDetail />} />
        <Route path="/create-chat" element={<CreateNewChatPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
