import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastMessageId, setLastMessageId] = useState("");

  const sendMessage = async () => {
    if (!idInstance || !apiTokenInstance || !phoneNumber || !message) return;

    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    const body = { chatId: `${phoneNumber}@c.us`, message };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.idMessage) {
        setMessages((prev) => [...prev, { text: message, sender: "me" }]);
        setMessage("");
        setLastMessageId(result.idMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const apiUrl = "https://1103.api.green-api.com";

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`);
      const data = await response.json();

      if (!data || !data.body) {
        console.log("Нет новых сообщений");
        return;
      }

      const { receiptId, body } = data;
      if (body.typeWebhook === "incomingMessageReceived") {
        const textMessage = body.messageData?.textMessageData?.textMessage;

        if (textMessage && body.idMessage !== lastMessageId) {
          setMessages((prev) => [...prev, { text: textMessage, sender: "them" }]);
          console.log("Сообщение от собеседника:", textMessage);
        }
      }

      if (receiptId) {
        await fetch(`${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`, {
          method: "DELETE",
        });
        console.log("Уведомление удалено:", receiptId);
      }
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval); 
  }, [idInstance, apiTokenInstance, lastMessageId]); 

  return (
    <div className="container">
      <h1 className="header">Green API</h1>

      <div className="input-section">
        <input placeholder="idInstance" value={idInstance} onChange={(e) => setIdInstance(e.target.value)} />
        <input placeholder="apiTokenInstance" value={apiTokenInstance} onChange={(e) => setApiTokenInstance(e.target.value)} />
        <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === "me" ? "sent" : "received"}>
            {msg.text}
          </p>
        ))}
      </div>

      <div className="message-input">
        <input placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default App;
