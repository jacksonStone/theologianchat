import './App.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

function App() {
  const [theologians, setTheologians] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetch("/theologians")
      .then((response) => response.json())
      .then((json) => setTheologians(json));
  }, []);
  
  useEffect(() => {
    fetch("/chats")
      .then((response) => response.json())
      .then((json) => setChats(json));
  }, []);

  const getTheologianDetails = (id) => {
    const theologian = theologians.find(theologian => theologian._id === id);
    return theologian || null;
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={
              <div>
                {chats.map(chat => {
                  const theologian = getTheologianDetails(chat.theologianId);
                  return (
                    <Link to={`/chat/${chat._id}`} key={chat._id}>
                      <div className="chat-item">
                        {theologian && <img src={theologian.imageUrl} alt={theologian.name} />}
                        <div>
                          <div className="theologian-details">
                            {theologian ? `${theologian.name} - ${theologian.description}` : 'Unknown Theologian'}
                          </div>
                          <div className="message-content">
                            {chat.firstMessage.content}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            } />
            <Route path="/chat/:chatId" element={<ChatDetail chats={chats} getTheologianDetails={getTheologianDetails} />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

function ChatDetail({ chats, getTheologianDetails }) {
  const { chatId } = useParams();
  const chat = chats.find(chat => chat._id === chatId);
  // TODO :: Fetch detail chat, show chat message, maybe pull into a different file
  if (!chat) return <div>Chat not found</div>;

  const theologian = getTheologianDetails(chat.theologianId);

  return (
    <div>
      <h1>Chat with {theologian ? theologian.name : 'Unknown Theologian'}</h1>
      <p>{chat.firstMessage.content}</p>
      {/* Display the rest of the chat history here */}
    </div>
  );
}

export default App;