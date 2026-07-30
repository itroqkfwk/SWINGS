import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_BASE_URL } from "../../config/runtime";

const SOCKET_URL = WS_BASE_URL;

let stompClient = null;

export const connectSocket = (onMessage) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    console.warn("Token missing. Skipping WebSocket connection.");
    return;
  }

  let username = null;
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);
    username = payload.username || payload.sub;

    if (!username) {
      console.warn("Could not extract username from token.");
      return;
    }
  } catch (error) {
    console.error("JWT parse error:", error);
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(SOCKET_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient.subscribe(`/topic/notification/${username}`, (message) => {
        const payload = JSON.parse(message.body);
        onMessage(payload);
      });
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    },
  });

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
  }
};
