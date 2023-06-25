import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ChatDetail() {
    const { chatId } = useParams();
    const [chatDetail, setChatDetail] = useState({ messages: [] });
    const [theologian, setTheologian] = useState({ name: '' });
  
    useEffect(() => {
      Promise.all([
        fetch("/api/chat/" + chatId).then((response) => response.json()),
        fetch("/api/theologians").then((response) => response.json())
      ]).then(([chatHistory, theologians]) => {
          setChatDetail(chatHistory)
          setTheologian(theologians.find(theologian => theologian._id === chatHistory.theologianId));
      })
    }, [chatId]);
  
    return (
      <div>
        <h1>Chat with {theologian.name}</h1>
        {chatDetail.messages.map(
          (message, i) => {
            return (<div key={i}>
              {message.author}:
              <div dangerouslySetInnerHTML={{ __html: message.content }}></div>
            </div>)
          }
        )}
      </div>
    );
  }

  export default ChatDetail;