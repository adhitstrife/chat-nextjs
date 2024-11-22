"use client";
import { useEffect, useRef, useState } from "react";

interface message {
  id: number;
  body: string;
}
export default function Home() {
  const [messages, setMessages] = useState<message[]>([]);
  const [guid, setguid] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    const ws = new WebSocket("wss://ruby-realtime-chat.onrender.com/cable");
    console.log(ws);
    ws.onopen = () => {
      console.log("connected to web server");
      setguid(Math.random().toString(36).substring(2, 15));

      ws.send(
        JSON.stringify({
          command: "subscribe",
          identifier: JSON.stringify({
            id: guid,
            channel: "MessagesChannel",
          }),
        })
      );

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (
          data.type === "ping" ||
          data.type === "welcome" ||
          data.type === "confirm_subscription"
        )
          return;

        const newMessage = data.message;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];

          // Scroll to the bottom after updating messages
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
              messageContainerRef.current.scrollHeight;
          }

          return updatedMessages;
        });
      };
    };
  }, []);

  const fetchMessages = async () => {
    const response = await fetch(
      "https://ruby-realtime-chat.onrender.com/messages"
    );
    const data = await response.json();
    setMessages(data);
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const body = form.message.value;
    form.message.value = "";

    const response = await fetch(
      "https://ruby-realtime-chat.onrender.com/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      }
    );
  };
  return (
    <div className="border p-6 w-full max-w-md mx-auto shadow-lg bg-white h-full sm:h-auto sm:rounded-lg mt-5">
      <div className="messageHeader text-center">
        <span className="text-2xl font-bold text-gray-800">Chat Messages</span>
        <p className="text-gray-500 text-sm mt-1">Guid: {guid}</p>
      </div>

      <div
        className="messages mt-6 overflow-y-auto max-h-64 p-4 border rounded-lg bg-gray-50 flex flex-col gap-3"
        id="messages"
      >
        {messages.map((message) => (
          <div className="message" key={message.id}>
            <div className="bg-blue-500 text-white inline-block px-3 py-2 rounded-lg shadow-md">
              <p className="text-sm">{message.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="messageForm mt-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-white border-t pt-3"
        >
          <input
            type="text"
            name="message"
            className="flex-grow border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            placeholder="Write your message here..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
