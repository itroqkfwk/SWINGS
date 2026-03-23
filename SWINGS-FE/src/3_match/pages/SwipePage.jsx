import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaBolt, FaHeart, FaThumbsUp } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import axios from "../../1_user/api/axiosInstance";
import SwipeCard from "../components/SwipeCard";
import SwipeModals from "../components/SwipeModals";
import { useSwipeData } from "../hooks/useSwipeData";

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
      await axios.post(
        `/api/dislikes/${currentUser.username}/${swipedProfile.username}`
      );
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
    <div className="px-3 py-4 sm:px-5 lg:px-8">
      <Toaster />

      <div className="mx-auto grid max-w-[1380px] gap-5 xl:grid-cols-[280px_minmax(360px,540px)_320px]">
        <aside className="hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] xl:flex xl:flex-col xl:justify-between">
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
              프로필을 천천히 보고 호감을 보내거나, 슈퍼챗을 사용해 바로 대화를 시작할 수
              있습니다.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] bg-slate-900 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                Free Likes
              </p>
              <p className="mt-3 text-3xl font-bold">{remainingLikes}</p>
              <p className="mt-1 text-sm text-slate-300">오늘 남은 무료 호감</p>
            </div>
            <div className="rounded-[1.5rem] bg-pink-50 px-5 py-4 text-slate-800">
              <p className="text-xs uppercase tracking-[0.24em] text-pink-500">
                Reset In
              </p>
              <p className="mt-3 text-2xl font-bold">{remainingTime}</p>
              <p className="mt-1 text-sm text-slate-500">다음 초기화까지</p>
            </div>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/swings/feed")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-pink-200 hover:text-pink-500"
              aria-label="뒤로가기"
            >
              <IoIosArrowBack size={24} />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500">
                Daily Match
              </p>
              <h2 className="mt-1 truncate text-xl font-black text-slate-900 sm:text-2xl">
                오늘의 추천 카드
              </h2>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Likes
              </p>
              <p className="text-sm font-bold text-slate-900">{remainingLikes}</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 xl:hidden">
            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                Free Likes
              </p>
              <p className="mt-2 text-xl font-bold">{remainingLikes}</p>
            </div>
            <div className="rounded-2xl bg-pink-50 px-4 py-3 text-slate-800">
              <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">
                Reset In
              </p>
              <p className="mt-2 text-lg font-bold">{remainingTime}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {profile ? (
                <motion.div
                  key={profile.username}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                >
                  <SwipeCard profile={profile} onSwipe={handleSwipe} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-12 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <FaHeart className="text-xl text-pink-500" />
                  </div>
                  <p className="mt-5 text-lg font-bold text-slate-900">
                    지금 보여드릴 추천 사용자가 없습니다.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    새로운 카드가 준비되면 다시 보여드릴게요.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLike}
                disabled={!profile}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition sm:text-base ${
                  profile
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                <FaThumbsUp />
                호감 보내기
              </button>

              <button
                onClick={() => setShowSuperChatModal(true)}
                disabled={!profile}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition sm:text-base ${
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

        <aside className="hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] xl:flex xl:flex-col xl:justify-between">
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
              웹에서는 안내 패널과 카드를 분리해 응답성을 높였고, 모바일에서는 한 화면 안에
              카드와 액션이 같이 보이도록 구성했습니다.
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
