import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  FaBolt,
  FaMapMarkerAlt,
  FaPhotoVideo,
  FaRegImages,
  FaUser,
} from "react-icons/fa";
import axios from "../../1_user/api/axiosInstance";
import { getProfileImageUrl } from "../../1_user/api/userApi";
import { createChatRoom } from "../../3_match/api/matchApi";
import ConfirmModal from "../../3_match/components/ConfirmModal";
import ImageModal from "./ImageModal";
import ProfileDetailModal from "./ProfileDetailModal";
import { normalizeImageUrl } from "../utils/imageUtils";

const regionMap = {
  SEOUL: "서울",
  BUSAN: "부산",
  DAEGU: "대구",
  INCHEON: "인천",
  GWANGJU: "광주",
  DAEJEON: "대전",
  ULSAN: "울산",
  SEJONG: "세종",
  GYEONGGI: "경기",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  JEJU: "제주",
};

const golfLevelMap = {
  beginner: "골프 입문",
  intermediate: "라운드 익숙",
  advanced: "실력파",
};

const tagStyles = [
  "bg-rose-50 text-rose-600",
  "bg-sky-50 text-sky-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
];

const buildTags = (user) =>
  [
    user?.activityRegion
      ? regionMap[user.activityRegion] || user.activityRegion
      : null,
    user?.birthDate ? `${user.birthDate.slice(2, 4)}년생` : null,
    user?.mbti || null,
    user?.golfSkill ? golfLevelMap[user.golfSkill] || user.golfSkill : null,
  ].filter(Boolean);

const SocialProfile = ({
  user,
  userStats,
  userIntroduce,
  isCurrentUser = false,
  isFollowing = false,
  onFollowToggle,
  onShowFollowers,
  onShowFollowing,
  feeds = [],
  onRequestCharge = () => {},
  onFeedClick = () => {},
  currentUser,
}) => {
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSuperChatModal, setShowSuperChatModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const navigate = useNavigate();

  const profileImage = user?.userImg
    ? getProfileImageUrl(user.userImg)
    : "/default-profile.jpg";
  const tags = buildTags(user);

  const openChatRoom = async ({ isSuperChat = false } = {}) => {
    if (!currentUser?.username || !user?.username) {
      return;
    }

    setLoadingChat(true);

    try {
      const response = await createChatRoom(
        currentUser.username,
        user.username,
        isSuperChat
      );

      const nextRoomId = response.data?.roomId;

      if (nextRoomId) {
        navigate(`/swings/chat/${nextRoomId}`);
      }
    } catch (error) {
      console.error("채팅방 열기 실패:", error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSuperChatConfirm = async () => {
    try {
      const data = new URLSearchParams();
      data.append("amount", "3");
      data.append("description", "슈퍼챗으로 채팅방 개설");

      await axios.post("/users/me/points/use", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await openChatRoom({ isSuperChat: true });
    } catch (error) {
      const message = error?.response?.data?.message || "";

      if (message.includes("포인트")) {
        setShowChargeModal(true);
      } else {
        console.error("슈퍼챗 실패:", error);
      }
    } finally {
      setShowSuperChatModal(false);
    }
  };

  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem]">
      <div className="border-b border-white/60 bg-gradient-to-br from-white via-rose-50/70 to-sky-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-[1.75rem] border border-white/70 shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:mx-0 sm:h-32 sm:w-32"
            >
              <img
                src={profileImage}
                alt="프로필 사진"
                className="h-full w-full object-cover"
              />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                  {user?.name || user?.username || "이름 없음"}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowProfileDetail(true)}
                  className="rounded-full border border-white/70 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  @{user?.username || "user"}
                </button>
              </div>

              <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {userIntroduce || "아직 자기소개가 없습니다."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        tagStyles[index % tagStyles.length]
                      }`}
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                    기본 프로필
                  </span>
                )}
              </div>

              {user?.activityRegion && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <FaMapMarkerAlt className="text-rose-400" />
                  <span>
                    활동 지역 {regionMap[user.activityRegion] || user.activityRegion}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] bg-white/80 p-3 shadow-sm sm:min-w-[18rem]">
            <button
              type="button"
              onClick={() => {}}
              className="rounded-2xl px-3 py-3 text-center transition hover:bg-slate-50"
            >
              <p className="text-xl font-black text-slate-900">
                {userStats?.posts || 0}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">피드</p>
            </button>
            <button
              type="button"
              onClick={() => onShowFollowers?.()}
              className="rounded-2xl px-3 py-3 text-center transition hover:bg-slate-50"
            >
              <p className="text-xl font-black text-slate-900">
                {userStats?.followers || 0}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">팔로워</p>
            </button>
            <button
              type="button"
              onClick={() => onShowFollowing?.()}
              className="rounded-2xl px-3 py-3 text-center transition hover:bg-slate-50"
            >
              <p className="text-xl font-black text-slate-900">
                {userStats?.following || 0}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">팔로잉</p>
            </button>
          </div>
        </div>

        {!isCurrentUser && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                isFollowing
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:brightness-105"
              }`}
              onClick={onFollowToggle}
            >
              {isFollowing ? "팔로우 중" : "팔로우"}
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => openChatRoom()}
              disabled={loadingChat}
            >
              {loadingChat ? <FaUser /> : <FaBolt />}
              {loadingChat ? "채팅방 여는 중..." : "채팅 열기"}
            </button>
          </div>
        )}

        {!isCurrentUser && (
          <div className="mt-3">
            <button
              type="button"
              className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              onClick={() => setShowSuperChatModal(true)}
            >
              슈퍼챗으로 바로 연결하기
            </button>
          </div>
        )}
      </div>

      <div className="px-3 pb-6 pt-4 sm:px-5 lg:px-6">
        {feeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
            <FaPhotoVideo className="text-4xl text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-700">
              아직 게시된 피드가 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              첫 게시물이 올라오면 여기가 갤러리처럼 보입니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {feeds.map((feed) => (
              <button
                key={feed.feedId}
                type="button"
                className="group aspect-square overflow-hidden rounded-[1.2rem] border border-white/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => onFeedClick(feed)}
              >
                {feed.imageUrl ? (
                  <img
                    src={normalizeImageUrl(feed.imageUrl)}
                    alt="피드 이미지"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-white px-3 text-center">
                    <FaRegImages className="text-2xl text-slate-300" />
                    <p className="line-clamp-4 text-xs leading-5 text-slate-600">
                      {feed.caption || "내용이 없습니다."}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSuperChatModal && (
        <ConfirmModal
          message={`슈퍼챗은 포인트 3개를 사용합니다.\n바로 채팅방을 열까요?`}
          confirmLabel="슈퍼챗 보내기"
          cancelLabel="취소"
          onConfirm={handleSuperChatConfirm}
          onCancel={() => setShowSuperChatModal(false)}
        />
      )}

      {showChargeModal && (
        <ConfirmModal
          message={`포인트가 부족합니다.\n충전 페이지로 이동할까요?`}
          confirmLabel="충전하러 가기"
          cancelLabel="닫기"
          onConfirm={onRequestCharge}
          onCancel={() => setShowChargeModal(false)}
        />
      )}

      {showImageModal && (
        <ImageModal
          imageUrl={profileImage}
          onClose={() => setShowImageModal(false)}
        />
      )}

      <AnimatePresence>
        {showProfileDetail && (
          <ProfileDetailModal
            user={user}
            onClose={() => setShowProfileDetail(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default SocialProfile;
