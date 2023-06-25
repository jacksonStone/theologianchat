import './App.css';
import React, {useEffect}from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  ChatDetail from "./ChatDetail"
import  ChatsPage from "./ChatsPage"

function App() {
  useEffect(() => {
    console.log('APP');
  }, [])
  return (
    <Router>
          <Routes>
            <Route path="/chat-history/:chatId" element={<ChatDetail />} />
            <Route path="/" element={<ChatsPage/>} />
          </Routes>
    </Router>
  );
}

export default App;