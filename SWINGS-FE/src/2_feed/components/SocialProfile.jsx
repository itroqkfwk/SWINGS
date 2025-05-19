import React, { useState, useRef, useEffect } from "react";
import { getProfileImageUrl } from "../../1_user/api/userApi";
import { FaPhotoVideo } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { createChatRoom } from "../../3_match/api/matchApi";
import axios from "../../1_user/api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeImageUrl } from "../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../3_match/components/ConfirmModal";

import ProfileDetailModal from "./ProfileDetailModal";
import ImageModal from "./ImageModal";

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
  const postsRef = useRef(null);
  const [showSuperChatModal, setShowSuperChatModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [hasChat, setHasChat] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const navigate = useNavigate();
  const [loadingChat, setLoadingChat] = useState(false);

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
    beginner: "골린이",
    intermediate: "중급자",
    advanced: "고급자",
  };

  // 태그별 배경색 설정
  const tagColors = {
    region: "bg-blue-50",
    birth: "bg-green-50",
    mbti: "bg-purple-50",
    skill: "bg-yellow-50",
  };

  const handleSuperChatConfirm = async () => {
    try {
      const data = new URLSearchParams();
      data.append("amount", 3);
      data.append("description", "슈퍼챗으로 채팅방 개설");

      await axios.post("/users/me/points/use", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const res = await createChatRoom(
        currentUser.username,
        user.username,
        false
      );
      const newRoomId = res.data?.roomId;
      if (newRoomId) {
        setRoomId(newRoomId);
        setHasChat(true);
        toast.success("💬 슈퍼챗으로 채팅방이 개설되었습니다!");
        navigate(`/swings/chat/${newRoomId}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes("포인트")) {
        setShowChargeModal(true);
      } else {
        toast.error("슈퍼챗 실패");
      }
    } finally {
      setShowSuperChatModal(false);
    }
  };

  useEffect(() => {
    if (!currentUser || !user || currentUser.username === user.username) return;

    const fetchRoom = async () => {
      if (!currentUser || !user) return;
      setLoadingChat(true);
      try {
        const res = await createChatRoom(
          currentUser.username,
          user.username,
          false
        );

        const id = res.data?.roomId;
        if (id) {
          setRoomId(id);
          setHasChat(true);
        }
      } catch (e) {
        console.error("채팅방 확인 실패", e);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchRoom();
  }, [currentUser, user]);

  return (
    <div className="relative max-w-4xl mx-auto bg-white rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex mb-6">
          <div className="mr-6 flex flex-col items-center">
            {/* 프로필 이미지 클릭 시 확대 모달 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shadow-lg">
                <img
                  src={
                    user?.userImg
                      ? getProfileImageUrl(user.userImg)
                      : "/default-profile.jpg"
                  }
                  alt="프로필 사진"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            {/* 닉네임에 테두리 추가하고 클릭 시 상세정보 표시 */}
            <button
              onClick={() => setShowProfileDetail(true)}
              className="mt-2 px-4 py-1.5 rounded-full border border-gray-300 bg-gradient-to-r from-white via-gray-50 to-white shadow-sm hover:shadow-md text-gray-800 text-sm font-semibold tracking-wide hover:scale-105 transition-all duration-200"
            >
              {user?.username || user?.name}
            </button>
          </div>

          <div className="flex-1 flex items-start pt-5">
            <div className="grid grid-cols-3 w-full text-center">
              <div className="flex flex-col">
                <span className="font-bold text-black">
                  {userStats?.posts || 0}
                </span>
                <span className="text-xs text-black">피드</span>
              </div>
              <div
                className="flex flex-col cursor-pointer"
                onClick={onShowFollowers}
              >
                <span className="font-bold text-black">
                  {userStats?.followers || 0}
                </span>
                <span className="text-xs text-black">팔로워</span>
              </div>
              <div
                className="flex flex-col cursor-pointer"
                onClick={onShowFollowing}
              >
                <span className="font-bold text-black">
                  {userStats?.following || 0}
                </span>
                <span className="text-xs text-black">팔로잉</span>
              </div>
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="mb-1">
          <p className="text-sm text-black text-left whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
            {userIntroduce || "아직 자기소개가 없습니다."}
          </p>
        </div>
        <br />
        {/* 해시태그를 자기소개 바로 밑에 배치 */}
        <div className="flex flex-wrap gap-2">
          {user?.activityRegion && (
            <span
              className={`rounded-full px-3 py-1 text-xs text-black ${tagColors.region}`}
            >
              #{regionMap[user.activityRegion] || user.activityRegion}
            </span>
          )}
          {user?.birthDate && (
            <span
              className={`rounded-full px-3 py-1 text-xs text-black ${tagColors.birth}`}
            >
              #{`${user.birthDate.slice(2, 4)}년생`}
            </span>
          )}
          {user?.mbti && (
            <span
              className={`rounded-full px-3 py-1 text-xs text-black ${tagColors.mbti}`}
            >
              #{user.mbti}
            </span>
          )}
          {user?.golfSkill && (
            <span
              className={`rounded-full px-3 py-1 text-xs text-black ${tagColors.skill}`}
            >
              #{golfLevelMap[user.golfSkill] || user.golfSkill}
            </span>
          )}
        </div>
      </div>

      {!isCurrentUser && (
        <div className="flex space-x-2 mb-4 px-4">
          <button
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
              isFollowing
                ? "bg-gray-100 text-black"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={onFollowToggle}
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>

          {hasChat ? (
            <button
              className="flex-1 py-1.5 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition"
              onClick={() => navigate(`/swings/chat/${roomId}`)}
            >
              메시지 💬
            </button>
          ) : (
            <button
              className="flex-1 py-1.5 rounded-md bg-yellow-400 text-white text-sm font-medium hover:bg-yellow-500 transition"
              onClick={() => setShowSuperChatModal(true)}
            >
              슈퍼챗 💎
            </button>
          )}
        </div>
      )}
      <hr />
      <div ref={postsRef} className="px-1 pb-6 mt-1">
        {feeds.length === 0 ? (
          <div className="text-center text-black py-12">
            <FaPhotoVideo className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">아직 게시된 콘텐츠가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px]">
            {feeds.map((feed) => (
              <div
                key={feed.feedId}
                className="aspect-square relative overflow-hidden cursor-pointer group border border-gray-300 bg-white"
                onClick={() => onFeedClick(feed)}
              >
                {feed.imageUrl ? (
                  <img
                    src={normalizeImageUrl(feed.imageUrl)}
                    alt="피드 이미지"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center px-2 bg-white">
                    <p className="text-black text-xs text-center line-clamp-3 whitespace-pre-wrap">
                      {feed.caption || "내용 없음"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 슈퍼챗 사용 확인 모달 */}
      {showSuperChatModal && (
        <ConfirmModal
          message={`슈퍼챗은 3하트를 사용합니다.\n사용하시겠어요?`}
          confirmLabel="사용하기"
          cancelLabel="취소"
          onConfirm={handleSuperChatConfirm}
          onCancel={() => setShowSuperChatModal(false)}
        />
      )}
      {/* 포인트 부족 시 충전 유도 모달 */}
      {showChargeModal && (
        <ConfirmModal
          message={`하트가 부족합니다.\n충전하러 가시겠어요?`}
          confirmLabel="충전소로 가기"
          cancelLabel="닫기"
          onConfirm={onRequestCharge}
          onCancel={() => setShowChargeModal(false)}
        />
      )}
      {/* 이미지 크게 보기 */}
      {showImageModal && (
        <ImageModal
          imageUrl={getProfileImageUrl(user.userImg)}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {/* 프로필 상세 모달 */}
      <AnimatePresence>
        {showProfileDetail && (
          <ProfileDetailModal
            user={user}
            onClose={() => setShowProfileDetail(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialProfile;
