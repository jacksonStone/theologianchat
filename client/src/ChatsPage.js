import './App.css';
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const getTheologianDetails = (theologians, id) => {
    const theologian = theologians.find(theologian => theologian._id === id);
    return theologian || null;
}
function ChatsPage() {
    const [theologians, setTheologians] = useState([]);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        fetch("/api/theologians")
            .then((response) => response.json())
            .then((json) => setTheologians(json));
    }, []);

    useEffect(() => {
        fetch("/api/chats")
            .then((response) => response.json())
            .then((json) => setChats(json));
    }, []);



    return (
        <div>
            {chats.map(chat => {
                const theologian = getTheologianDetails(theologians, chat.theologianId);
                return (
                    <Link to={`/chat-history/${chat._id}`} key={chat._id}>
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
    );
}

export default ChatsPage;