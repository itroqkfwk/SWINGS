import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MoreVertical } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import axios from "../../1_user/api/axiosInstance";
import { fetchUserData } from "../../1_user/api/userApi";
import { WS_BASE_URL } from "../../config/runtime";
import { fetchChatMessages } from "../api/chatRoomApi";
import ConfirmModal from "../components/ConfirmModal";

const createDummyMessages = (dummyRoom, username) => [
  {
    sender: dummyRoom?.targetUsername || "golf_sumin",
    senderName: dummyRoom?.targetName || "수민",
    content: "안녕하세요. 프로필 분위기가 좋아서 먼저 인사드려요 :)",
    sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    sender: username || "me",
    senderName: "나",
    content: "반가워요. 요즘 스크린 자주 치세요?",
    sentAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    sender: dummyRoom?.targetUsername || "golf_sumin",
    senderName: dummyRoom?.targetName || "수민",
    content: "주 1~2번 정도 쳐요. 라운드도 좋아해서 주말 일정 맞으면 좋겠어요.",
    sentAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
];

const ChatRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dummyRoom = location.state?.dummyRoom;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isDummyRoom = String(roomId).startsWith("dummy-room");

  const markMessagesAsRead = async (targetRoomId, username) => {
    try {
      await axios.post("/api/chat/messages/read", null, {
        params: { roomId: targetRoomId, username },
      });
    } catch (error) {
      console.error("읽음 처리 실패:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchUserData();
        setCurrentUser(user);

        if (isDummyRoom) {
          setMessages(createDummyMessages(dummyRoom, user.username));
          return;
        }

        const response = await fetchChatMessages(roomId);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setMessages(data.length > 0 ? data : createDummyMessages(dummyRoom, user.username));
        await markMessagesAsRead(roomId, user.username);
      } catch (error) {
        console.error("채팅 데이터 로딩 실패:", error);
        setMessages(createDummyMessages(dummyRoom, currentUser?.username));
      }
    };

    loadData();

    if (isDummyRoom) {
      return undefined;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/chat/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, isDummyRoom, dummyRoom, currentUser?.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !currentUser) {
      return;
    }

    if (isDummyRoom) {
      setMessages((prev) => [
        ...prev,
        {
          sender: currentUser.username,
          senderName: "나",
          content: input,
          sentAt: new Date().toISOString(),
        },
      ]);
      setInput("");
      return;
    }

    if (!clientRef.current?.connected) {
      return;
    }

    clientRef.current.publish({
      destination: "/app/chat/message",
      body: JSON.stringify({
        roomId,
        sender: currentUser.username,
        content: input,
      }),
    });

    setInput("");
  };

  const leaveChatRoom = async () => {
    if (!currentUser) {
      return;
    }

    if (isDummyRoom) {
      navigate("/swings/chat");
      return;
    }

    try {
      await axios.post("/api/chat/leave", null, {
        params: { roomId, username: currentUser.username },
      });

      clientRef.current?.publish({
        destination: "/app/chat/message",
        body: JSON.stringify({
          roomId,
          sender: "SYSTEM",
          content: `${currentUser.username}님이 대화를 나갔습니다.`,
        }),
      });

      navigate("/swings/chat");
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
    }
  };

  if (!currentUser && messages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        로그인한 사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-4 shadow">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
            <IoIosArrowBack size={24} />
          </button>
          <h1 className="relative -top-[1px] text-lg font-bold">
            {dummyRoom?.targetName ? `${dummyRoom.targetName}님과의 채팅` : "채팅방"}
          </h1>
        </div>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="text-gray-600 hover:text-black"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="absolute bottom-24 top-14 w-full overflow-y-auto p-4">
        {messages.map((message, index) => {
          const isMe = message.sender === currentUser?.username;

          if (message.sender === "SYSTEM") {
            return (
              <div key={index} className="my-4 flex justify-center">
                <div className="rounded-xl bg-gray-200 px-4 py-2 text-center text-sm text-gray-700 shadow">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={`${message.sender}-${index}`}
              className={`mb-5 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs ${isMe ? "text-right" : "text-left"}`}>
                <p
                  className={`mb-2 text-sm font-semibold ${
                    isMe ? "text-custom-pink" : "text-gray-700"
                  }`}
                >
                  {message.senderName || message.sender}
                </p>
                <div
                  className={`inline-block break-words rounded-xl px-4 py-2 text-sm font-bold ${
                    isMe
                      ? "bg-custom-pink text-white"
                      : "border bg-white text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
                {message.sentAt && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    {new Date(message.sentAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-12 left-0 mb-2 flex w-full items-center bg-white p-4">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요..."
          className="mr-2 flex-grow rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={sendMessage}
          className="rounded bg-custom-pink px-4 py-2 font-bold text-white"
        >
          전송
        </button>
      </div>

      {showLeaveModal && (
        <ConfirmModal
          message="채팅방을 나가시겠어요?"
          cancelLabel="취소"
          confirmLabel="나가기"
          onConfirm={() => {
            setShowLeaveModal(false);
            leaveChatRoom();
          }}
          onCancel={() => setShowLeaveModal(false)}
        />
      )}
    </div>
  );
};

export default ChatRoomPage;
