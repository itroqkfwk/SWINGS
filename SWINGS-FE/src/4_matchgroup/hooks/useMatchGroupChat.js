import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_BASE_URL } from "../../config/runtime";
import { getToken } from "../../1_user/utils/userUtils";

export const useMatchGroupChat = (matchGroupId, isAuthorized, currentUser) => {
  const clientRef = useRef(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isAuthorized || !matchGroupId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      connectHeaders: {
        Authorization: `Bearer ${getToken()}`,
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/matchgroup/${matchGroupId}`, (message) => {
        const received = JSON.parse(message.body);
        setMessages((prev) => [...prev, received]);
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [isAuthorized, matchGroupId]);

  const sendMessage = () => {
    if (
      chatInput.trim() === "" ||
      !clientRef.current?.connected ||
      !currentUser
    ) {
      return;
    }

    const chatMessage = {
      roomId: Number(matchGroupId),
      sender: currentUser.username,
      content: chatInput,
      sentAt: new Date().toISOString(),
    };

    clientRef.current.publish({
      destination: `/app/chat.send/${matchGroupId}`,
      body: JSON.stringify(chatMessage),
    });
    setChatInput("");
  };

  return {
    chatInput,
    setChatInput,
    messages,
    setMessages,
    sendMessage,
  };
};
