import './App.css';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
const getTheologianDetails = (theologians, id) => {
    const theologian = theologians.find(theologian => theologian._id === id);
    return theologian || null;
}
const fetchChats = () => {
    return fetch("/api/chats").then((response) => response.json());
}
const fetchTheologians = () => {
    return fetch("/api/theologians")
            .then((response) => response.json())
}
const deleteChat = (id) => {
    return fetch(`/api/chat/${id}`, {
        method: 'DELETE',
    });
}
const createChat = (selectedTheologian) => {
    return fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ theologianId: selectedTheologian })
    }).then((response) => response.json())

}

function ChatsPage() {
    const [theologians, setTheologians] = useState([]);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        fetchTheologians().then(setTheologians);
    }, []);

    useEffect(() => {
        fetchChats().then(setChats);
    }, []);

    const deleteChatThenFetch = async (id) => {
        deleteChat(id).then(fetchChats).then(setChats);
    };
    const createThenNavigate = async () => {
        const newChat = await createChat(selectedTheologian);
        navigate(`/chat-history/${newChat.insertedId}`);
    }


    const [selectedTheologian, setSelectedTheologian] = useState("");
    const navigate = useNavigate();

    return (
        <div>
            <select value={selectedTheologian} onChange={(e) => setSelectedTheologian(e.target.value)}>
                <option value="">Select a theologian...</option>
                {theologians.map((theologian) => (
                    <option value={theologian._id} key={theologian._id}>{theologian.name}</option>
                ))}
            </select>

            <button onClick={createThenNavigate} disabled={!selectedTheologian}>Start a new chat</button>

            {chats.map(chat => {
                const theologian = getTheologianDetails(theologians, chat.theologianId);
                return (
                    <div key={chat._id}>
                        <Link to={`/chat-history/${chat._id}`} key={chat._id}>
                            <div className="chat-item">
                                {theologian && <img src={theologian.imageUrl} alt={theologian.name} />}
                                <div>
                                    <div className="theologian-details">
                                        {theologian ? `${theologian.name} - ${theologian.description}` : 'Unknown Theologian'}
                                    </div>
                                    <div className="message-content">
                                        {chat.firstMessage?.content || 'No messages yet'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <button onClick={() => deleteChatThenFetch(chat._id)}>Delete chat</button>
                    </div>

                );
            })}
        </div>
    );
}

export default ChatsPage;