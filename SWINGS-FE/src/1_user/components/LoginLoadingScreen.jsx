import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaImages, FaUserFriends } from "react-icons/fa";

const messages = [
  {
    key: "match",
    label: "Today’s Match",
    text: "잘 맞는 상대를 고르는 중",
    subtext: "취향과 분위기가 맞는 카드를 먼저 정리하고 있어요.",
    accent: "from-rose-400 via-pink-400 to-orange-300",
    icon: <FaHeart className="h-8 w-8 text-white" />,
  },
  {
    key: "mate",
    label: "Golf Circle",
    text: "라운드 메이트 연결 중",
    subtext: "골프 성향과 활동 흐름을 바탕으로 추천 순서를 맞추고 있어요.",
    accent: "from-emerald-400 via-green-400 to-lime-300",
    icon: <FaUserFriends className="h-8 w-8 text-white" />,
  },
  {
    key: "feed",
    label: "Live Feed",
    text: "피드와 소식을 불러오는 중",
    subtext: "내 피드와 연결된 사용자 소식을 함께 준비하고 있습니다.",
    accent: "from-sky-400 via-blue-400 to-indigo-400",
    icon: <FaImages className="h-8 w-8 text-white" />,
  },
];

export default function LoginLoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  const current = messages[index];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[radial-gradient(circle_at_top,#ffe3ee_0%,#fffafc_42%,#dbeafe_100%)]">
      <div className="absolute inset-0">
        <Motion.div
          className="absolute left-[10%] top-[14%] h-48 w-48 rounded-full bg-rose-200/60 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <Motion.div
          className="absolute bottom-[12%] right-[10%] h-56 w-56 rounded-full bg-sky-200/60 blur-3xl"
          animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/70 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                SWINGS
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                로그인 후 화면을 준비하고 있습니다
              </p>
            </div>

            <div className="flex gap-1.5">
              {messages.map((message, messageIndex) => (
                <span
                  key={message.key}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    messageIndex === index
                      ? "w-8 bg-slate-900"
                      : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <Motion.div
              key={current.key}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.97 }}
              transition={{ duration: 0.45 }}
              className="rounded-[1.75rem] bg-slate-950 px-5 py-6 text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                    {current.label}
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-tight">
                    {current.text}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {current.subtext}
                  </p>
                </div>

                <Motion.div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${current.accent} shadow-lg`}
                  animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {current.icon}
                </Motion.div>
              </div>
            </Motion.div>
          </AnimatePresence>

          <div className="mt-5 space-y-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <Motion.div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-sky-400"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>추천 카드와 피드를 맞춤 구성하는 중</span>
              <span>잠시만 기다려주세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
