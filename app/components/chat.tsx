"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ActionCable from "@rails/actioncable";

type Message = {
  user: string;
  content: string;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Fetch initial messages
    axios
      .get("http://localhost:3001/messages")
      .then((response) => setMessages(response.data))
      .catch((error) => console.error("Error fetching messages:", error));

    // Set up Action Cable consumer
    const cable = ActionCable.createConsumer();
    const channel = cable.subscriptions.create("MessagesChannel", {
      received: (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    axios
      .post("http://localhost:3001/messages", {
        content: newMessage,
        user: username,
      })
      .then(() => setNewMessage(""))
      .catch((error) => console.error("Error sending message:", error));
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <strong>{message.user}:</strong> {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          required
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
