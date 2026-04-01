import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { MessageCircleMore, Search, Sparkles, Heart } from "lucide-react";
import axios from "../../1_user/api/axiosInstance";
import { fetchUserData, getProfileImageUrl } from "../../1_user/api/userApi";

const createDummyChatRooms = (username) => [
  {
    roomId: "dummy-room-1",
    targetUsername: "golf_sumin",
    targetImg: null,
    targetName: "수민",
    lastMessage: "이번 주말에 스크린 게임 하실래요?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    isDummy: true,
  },
  {
    roomId: "dummy-room-2",
    targetUsername: "birdie_haeun",
    targetImg: null,
    targetName: "하은",
    lastMessage: `${username || "회원"}님, 라운드 스타일이 정말 잘 맞을 것 같아요.`,
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

function formatRoomTime(value) {
  if (!value) return "";

  const date = dayjs(value);
  const now = dayjs();

  if (date.isSame(now, "day")) {
    return date.format("HH:mm");
  }

  if (date.isSame(now.subtract(1, "day"), "day")) {
    return "어제";
  }

  return date.format("MM.DD");
}

export default function ChatListPage() {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData);

        const response = await axios.get(
          `/api/chat/rooms?userId=${userData.username}`
        );
        const parsed =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatRooms(parsed);
          return;
        }

        setChatRooms(createDummyChatRooms(userData.username));
      } catch (error) {
        console.error("채팅방 목록을 불러오지 못했습니다:", error);
        setChatRooms(createDummyChatRooms());
      }
    };

    loadChatRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return chatRooms;
    }

    return chatRooms.filter((room) => {
      const haystack = [room.targetName, room.targetUsername, room.lastMessage]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [chatRooms, searchTerm]);

  const unreadTotal = useMemo(
    () =>
      chatRooms.reduce(
        (count, room) => count + Number(room.unreadCount || 0),
        0
      ),
    [chatRooms]
  );

  if (!currentUser && chatRooms.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center rounded-[2rem] border border-white/60 bg-white/70 px-6 text-sm text-slate-500 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        채팅 목록을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-[0_25px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
      <div className="relative overflow-hidden border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,244,247,0.92)_45%,rgba(239,246,255,0.88))] px-5 py-5 sm:px-7">
        <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-4rem] left-[-2rem] h-36 w-36 rounded-full bg-sky-200/45 blur-3xl" />

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                대화 중인 채팅
              </div>
              <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-900 sm:text-3xl">
                채팅 라운지
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                마음에 든 상대와 이어지는 대화를 한곳에서 편하게 확인해보세요.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  `/swings/chat/likes/${currentUser?.username || "demo"}`
                )
              }
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(244,114,182,0.32)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_34px_rgba(244,114,182,0.4)]"
            >
              <Heart className="h-4 w-4" />
              좋아요 보관함
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/85 px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="이름, 아이디, 메시지로 검색"
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.2rem] border border-white/80 bg-slate-950 px-4 py-3 text-white shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                  채팅방
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  {chatRooms.length}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/80 bg-white/85 px-4 py-3 text-slate-900 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  안 읽음
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  {unreadTotal}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(248,250,252,0.92))] px-3 py-3 sm:px-4 sm:py-4">
        <div className="h-full overflow-y-auto rounded-[1.6rem] border border-white/75 bg-white/75 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:p-3">
          {filteredRooms.length === 0 ? (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-slate-200 bg-white/70 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <MessageCircleMore className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-[-0.03em] text-slate-900">
                검색 결과가 없어요
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                다른 검색어를 입력하거나 좋아요를 보낸 프로필에서 새 대화를 시작해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRooms.map((room) => {
                const profileImgUrl = room.targetImg
                  ? getProfileImageUrl(room.targetImg)
                  : "/default-profile.jpg";

                return (
                  <button
                    key={room.roomId}
                    type="button"
                    onClick={() =>
                      navigate(`/swings/chat/${room.roomId}`, {
                        state: room.isDummy ? { dummyRoom: room } : undefined,
                      })
                    }
                    className="group flex w-full items-center gap-4 rounded-[1.4rem] border border-transparent bg-white/80 px-4 py-4 text-left shadow-sm transition hover:border-rose-100 hover:bg-white hover:shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-300/35 to-sky-200/40 blur-md transition group-hover:scale-110" />
                      <img
                        src={profileImgUrl}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/default-profile.jpg";
                        }}
                        alt={`${room.targetName || "회원"} 프로필`}
                        className="relative h-14 w-14 rounded-full border border-white/80 object-cover shadow-md"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold tracking-[-0.02em] text-slate-900">
                            {room.targetName || "알 수 없는 회원"}
                          </p>
                          <p className="truncate text-xs font-medium text-slate-400">
                            @{room.targetUsername}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-slate-400">
                            {formatRoomTime(room.lastMessageTime)}
                          </p>
                          {room.unreadCount > 0 && (
                            <span className="mt-2 inline-flex min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-1 text-[11px] font-bold text-white shadow-[0_10px_20px_rgba(244,114,182,0.28)]">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-2 truncate text-sm leading-6 text-slate-500">
                        {room.lastMessage || "아직 주고받은 메시지가 없어요."}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
