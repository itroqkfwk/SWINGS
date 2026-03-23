import React from "react";
import TinderCard from "react-tinder-card";
import { FaCommentDots, FaMapMarkerAlt, FaMars, FaVenus } from "react-icons/fa";
import defaultImg1 from "../../assets/default-profile-optimized.jpg";
import { getProfileImageUrl } from "../../1_user/api/userApi";

const regionToKorean = {
  SEOUL: "서울",
  BUSAN: "부산",
  DAEGU: "대구",
  INCHEON: "인천",
  GWANGJU: "광주",
  DAEJEON: "대전",
  ULSAN: "울산",
  JEJU: "제주",
  ETC: "기타",
  GYEONGGI: "경기",
};

const SwipeCard = ({ profile, onSwipe }) => {
  if (!profile) {
    return null;
  }

  const image = profile.userImg ? getProfileImageUrl(profile.userImg) : defaultImg1;
  const activityRegion = regionToKorean[profile.activityRegion] || "지역 미정";
  const genderLabel = profile.gender === "male" ? "남성" : "여성";

  return (
    <div className="flex w-full justify-center">
      <TinderCard
        key={profile.username}
        onSwipe={(direction) => onSwipe(direction, profile)}
        preventSwipe={["up", "down"]}
      >
        <article className="mx-auto flex w-full max-w-[36rem] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="relative aspect-[4/4.2] max-h-[30rem] min-h-[18rem] w-full overflow-hidden bg-slate-100">
            <img src={image} alt="프로필 이미지" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-2xl font-black text-slate-900">
                    {profile.name || "이름 없음"}
                  </h2>
                  {profile.gender === "male" ? (
                    <FaMars className="shrink-0 text-lg text-sky-500" />
                  ) : (
                    <FaVenus className="shrink-0 text-lg text-pink-500" />
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  @{profile.username || "user"}
                </p>
              </div>

              <div className="rounded-full bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-600">
                TODAY PICK
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <FaMapMarkerAlt className="text-pink-500" />
                <span>{activityRegion}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {profile.gender === "male" ? (
                  <FaMars className="text-sky-500" />
                ) : (
                  <FaVenus className="text-pink-500" />
                )}
                <span>{genderLabel}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <FaCommentDots className="text-amber-500" />
                <span>대화 가능</span>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-pink-50 to-white px-4 py-4 shadow-inner">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500">
                Introduce
              </p>
              <p className="mt-2 line-clamp-5 text-sm leading-6 text-slate-700 sm:text-[15px]">
                {profile.introduce || "아직 소개글이 없습니다."}
              </p>
            </div>
          </div>
        </article>
      </TinderCard>
    </div>
  );
};

export default SwipeCard;
