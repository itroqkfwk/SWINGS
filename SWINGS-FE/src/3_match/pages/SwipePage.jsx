import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaBolt, FaThumbsUp } from "react-icons/fa";
import axios from "../../1_user/api/axiosInstance";
import SwipeCard from "../components/SwipeCard";
import SwipeModals from "../components/SwipeModals";
import { useSwipeData } from "../hooks/useSwipeData";

const MotionDiv = motion.div;

function SwipePage() {
  const {
    currentUser,
    profile,
    remainingLikes,
    fetchRecommendedUser,
    fetchRemainingLikes,
  } = useSwipeData();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showSuperChatModal, setShowSuperChatModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setRemainingTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSwipe = async (_, swipedProfile) => {
    if (!currentUser || !swipedProfile) {
      return;
    }

    try {
      await axios.post(`/api/dislikes/${currentUser.username}/${swipedProfile.username}`);
      fetchRecommendedUser(currentUser.username);
    } catch (error) {
      console.error("스와이프 처리 실패:", error);
      toast.error("처리 중 문제가 발생했습니다.");
    }
  };

  const sendLikeRequest = async (isPaid) => {
    if (!currentUser || !profile) {
      return;
    }

    try {
      await axios.post(`/api/likes/${currentUser.username}/${profile.username}`, null, {
        params: { paid: isPaid },
      });

      toast.success("호감을 보냈습니다.");
      fetchRemainingLikes(currentUser.username);
      fetchRecommendedUser(currentUser.username);
    } catch (error) {
      if (error.response?.status === 400) {
        setShowChargeModal(true);
      } else {
        toast.error("호감 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleLike = () => {
    if (!profile || !currentUser) {
      return;
    }

    if (remainingLikes <= 0) {
      setShowConfirmModal(true);
      return;
    }

    sendLikeRequest(false);
  };

  const confirmSuperChat = async () => {
    if (!currentUser || !profile) {
      return;
    }

    try {
      const data = new URLSearchParams();
      data.append("amount", "3");
      data.append("description", "슈퍼챗 사용");

      await axios.post("/users/me/points/use", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      await axios.post("/api/chat/room", null, {
        params: {
          user1: currentUser.username,
          user2: profile.username,
          isSuperChat: true,
        },
      });

      toast.success("슈퍼챗으로 바로 채팅방이 열렸습니다.");
      fetchRecommendedUser(currentUser.username);
    } catch (error) {
      const message = error.response?.data?.message || "";
      const status = error.response?.status;

      if (status === 400 || message.includes("포인트")) {
        setShowChargeModal(true);
      } else {
        console.error("슈퍼챗 처리 실패:", error);
        toast.error("슈퍼챗 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setShowSuperChatModal(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 text-slate-500">
        로그인한 사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="px-2 py-2 sm:px-5 lg:px-8">
      <Toaster />

      <div className="mx-auto grid max-w-[1520px] gap-4 xl:grid-cols-[minmax(260px,1fr)_minmax(380px,560px)_minmax(260px,1fr)] xl:items-start">
        <aside className="hidden w-full max-w-[300px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] xl:flex xl:flex-col xl:justify-between xl:justify-self-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-500">
              SWINGS Match
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900">
              골프 취향에 맞는
              <br />
              오늘의 소개팅
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              프로필을 천천히 보고 호감을 보내거나, 슈퍼챗으로 바로 대화를 시작할 수
              있습니다.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] bg-slate-900 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Free Likes</p>
              <p className="mt-3 text-3xl font-bold">{remainingLikes}</p>
              <p className="mt-1 text-sm text-slate-300">오늘 남은 무료 호감</p>
            </div>
            <div className="rounded-[1.5rem] bg-pink-50 px-5 py-4 text-slate-800">
              <p className="text-xs uppercase tracking-[0.24em] text-pink-500">Reset In</p>
              <p className="mt-3 text-2xl font-bold">{remainingTime}</p>
              <p className="mt-1 text-sm text-slate-500">다음 초기화까지</p>
            </div>
          </div>
        </aside>

        <section className="w-full rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-4 xl:justify-self-center">
          <div className="relative mb-2 flex items-center justify-end sm:justify-between">
            <div className="absolute left-1/2 min-w-0 -translate-x-1/2 text-center sm:static sm:left-auto sm:flex-1 sm:translate-x-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-pink-500">
                Daily Match
              </p>
              <h2 className="mt-0.5 hidden truncate text-base font-black text-slate-900 sm:block sm:text-2xl">
                오늘의 추천 프로필
              </h2>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-sm sm:bg-slate-100 sm:px-2 sm:py-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-pink-400 sm:text-slate-400">
                Likes
              </span>
              <span className="text-[11px] font-bold text-slate-900 sm:text-xs">
                {remainingLikes}
              </span>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between rounded-[1rem] border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 xl:hidden">
            <span className="truncate">Free {remainingLikes}</span>
            <span className="mx-2 h-3 w-px shrink-0 bg-slate-200" />
            <span className="truncate text-pink-500">Reset {remainingTime}</span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="wait">
              {profile ? (
                <MotionDiv
                  key={profile.username}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                >
                  <SwipeCard profile={profile} onSwipe={handleSwipe} />
                </MotionDiv>
              ) : (
                <MotionDiv
                  key="empty-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-7 text-center"
                >
                  <p className="text-base font-bold text-slate-900">
                    지금 보여드릴 추천 사용자가 없습니다.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    새로운 카드가 준비되면 다시 보여드릴게요.
                  </p>
                </MotionDiv>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleLike}
                disabled={!profile}
                className={`flex items-center justify-center gap-1.5 rounded-[1rem] px-3 py-2 text-xs font-bold shadow-md transition sm:text-sm ${
                  profile
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                <FaThumbsUp />
                호감
              </button>

              <button
                onClick={() => setShowSuperChatModal(true)}
                disabled={!profile}
                className={`flex items-center justify-center gap-1.5 rounded-[1rem] px-3 py-2 text-xs font-bold shadow-md transition sm:text-sm ${
                  profile
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                <FaBolt />
                슈퍼챗
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden w-full max-w-[300px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] xl:flex xl:flex-col xl:justify-between xl:justify-self-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Guide
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-bold text-slate-900">호감 보내기</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  오늘 남아 있는 무료 호감을 사용해 상대에게 관심을 표현할 수 있습니다.
                </p>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-4">
                <p className="text-sm font-bold text-slate-900">슈퍼챗</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  포인트 3개로 바로 채팅방을 만들고 대화를 시작할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-pink-600 px-5 py-5 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Tip</p>
            <p className="mt-3 text-base font-bold leading-8">
              모바일에서는 카드를 중심에 두고 핵심 정보만 빠르게 확인할 수 있게
              구성했습니다.
            </p>
          </div>
        </aside>
      </div>

      <SwipeModals
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        showChargeModal={showChargeModal}
        setShowChargeModal={setShowChargeModal}
        showSuperChatModal={showSuperChatModal}
        setShowSuperChatModal={setShowSuperChatModal}
        sendLikeRequest={sendLikeRequest}
        confirmSuperChat={confirmSuperChat}
        navigate={navigate}
      />
    </div>
  );
}

export default SwipePage;
