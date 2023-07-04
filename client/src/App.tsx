import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatDetail from './ChatDetailView';
import ChatsPage from './ChatsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/chat-history/:chatId" element={<ChatDetail />} />
        <Route path="/" element={<ChatsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
