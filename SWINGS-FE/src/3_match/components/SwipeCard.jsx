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
        <article className="mx-auto flex w-full max-w-[34rem] flex-col overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:max-w-[36rem] sm:rounded-[2rem]">
          <div className="relative aspect-[4/3.05] max-h-[18.5rem] min-h-[11rem] w-full overflow-hidden bg-slate-100 sm:aspect-[4/4.1] sm:max-h-[30rem] sm:min-h-[18rem]">
            <img src={image} alt="프로필 이미지" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 via-black/10 to-transparent sm:h-24" />
          </div>

          <div className="flex flex-col gap-2.5 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-black text-slate-900 sm:text-2xl">
                    {profile.name || "이름 없음"}
                  </h2>
                  {profile.gender === "male" ? (
                    <FaMars className="shrink-0 text-base text-sky-500 sm:text-lg" />
                  ) : (
                    <FaVenus className="shrink-0 text-base text-pink-500 sm:text-lg" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 sm:mt-1 sm:text-sm">
                  @{profile.username || "user"}
                </p>
              </div>

              <div className="rounded-full bg-pink-50 px-2 py-1 text-[9px] font-semibold text-pink-600 sm:px-3 sm:py-2 sm:text-xs">
                추천 프로필
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 sm:gap-2">
              <div className="flex items-center justify-center gap-1.5 rounded-[0.95rem] bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600 sm:justify-start sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm">
                <FaMapMarkerAlt className="text-pink-500" />
                <span>{activityRegion}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-[0.95rem] bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600 sm:justify-start sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm">
                {profile.gender === "male" ? (
                  <FaMars className="text-sky-500" />
                ) : (
                  <FaVenus className="text-pink-500" />
                )}
                <span>{genderLabel}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-[0.95rem] bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600 sm:justify-start sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm">
                <FaCommentDots className="text-amber-500" />
                <span>대화 가능</span>
              </div>
            </div>

            <div className="rounded-[1.15rem] bg-gradient-to-br from-pink-50 to-white px-3 py-2.5 shadow-inner sm:rounded-[1.5rem] sm:px-4 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-pink-500 sm:text-[11px] sm:tracking-[0.24em]">
                Introduce
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-700 sm:mt-2 sm:line-clamp-5 sm:text-[15px] sm:leading-6">
                {profile.introduce || "아직 소개글이 등록되지 않았습니다."}
              </p>
            </div>
          </div>
        </article>
      </TinderCard>
    </div>
  );
};

export default SwipeCard;
