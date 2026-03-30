import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import axios from "../../1_user/api/axiosInstance";
import { fetchUserData, getProfileImageUrl } from "../../1_user/api/userApi";

const createDummyChatRooms = (username) => [
  {
    roomId: "dummy-room-1",
    targetUsername: "golf_sumin",
    targetImg: null,
    targetName: "수민",
    lastMessage: "이번 주말에 스크린 한 게임 하실래요?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    isDummy: true,
  },
  {
    roomId: "dummy-room-2",
    targetUsername: "birdie_haeun",
    targetImg: null,
    targetName: "하은",
    lastMessage: `${username || "회원"}님, 라운드 스타일이 정말 잘 맞을 것 같아요 :)`,
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    unreadCount: 0,
    isDummy: true,
  },
  {
    roomId: "dummy-room-3",
    targetUsername: "putt_jiyoon",
    targetImg: null,
    targetName: "지윤",
    lastMessage: "연습은 보통 어디로 가세요?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    unreadCount: 1,
    isDummy: true,
  },
];

const ChatListPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData);

        const response = await axios.get(`/api/chat/rooms?userId=${userData.username}`);
        const parsed = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatRooms(parsed);
          return;
        }

        setChatRooms(createDummyChatRooms(userData.username));
      } catch (error) {
        console.error("채팅방 목록 조회 실패:", error);
        setChatRooms(createDummyChatRooms());
      }
    };

    loadChatRooms();
  }, []);

  if (!currentUser && chatRooms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        로그인한 사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen h-full flex-col bg-gradient-to-b from-white via-slate-100 to-white text-gray-900">
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 px-4 pb-20">
        {chatRooms.length === 0 ? (
          <p className="animate-pulse py-10 text-center text-gray-400">아직 채팅방이 없습니다.</p>
        ) : (
          chatRooms.map((room, index) => {
            const profileImgUrl = room.targetImg
              ? getProfileImageUrl(room.targetImg)
              : "/images/default-profile.png";

            return (
              <motion.div
                key={room.roomId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer py-4 hover:bg-gray-50"
                onClick={() =>
                  navigate(`/swings/chat/${room.roomId}`, {
                    state: room.isDummy ? { dummyRoom: room } : undefined,
                  })
                }
              >
                <div className="flex items-center gap-4">
                  <img
                    src={profileImgUrl}
                    onError={(event) => {
                      event.target.onerror = null;
                      event.target.src = "/images/default-profile.png";
                    }}
                    alt={`${room.targetName || "프로필"} 프로필`}
                    className="h-12 w-12 rounded-full object-cover shadow-sm"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">
                        {room.targetName || "이름 없음"}
                        <span className="ml-1 text-xs text-gray-500">@{room.targetUsername}</span>
                      </p>
                      <span className="text-xs text-gray-400">
                        {room.lastMessageTime ? dayjs(room.lastMessageTime).format("HH:mm") : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="max-w-[200px] truncate text-sm text-gray-600">
                        {room.lastMessage || "아직 메시지가 없습니다."}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 px-2 text-[11px] font-bold text-white">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate(`/swings/chat/likes/${currentUser?.username || "demo"}`)}
        className="fixed bottom-24 right-6 z-[60] flex items-center justify-center rounded-full bg-custom-pink p-3 text-white shadow-lg transition-all duration-300 outline-none focus:outline-none"
        aria-label="좋아요를 보낸 사용자 목록"
      >
        <Heart size={20} />
      </button>
    </div>
  );
};

export default ChatListPage;
