import BaseModal from "./ui/BaseModal.jsx";
import { getProfileImageUrl } from "../../1_user/api/userApi";

const ParticipantDetailModal = ({ isOpen, onClose, participant }) => {
  if (!isOpen || !participant) return null;

  const displayName = participant.name || participant.username || "참가자";
  const imageUrl = participant.userImg
    ? getProfileImageUrl(participant.userImg)
    : "/default-profile.png";

  return (
    <BaseModal onClose={onClose} title={`${displayName}님의 프로필`}>
      <div className="flex flex-col items-center gap-4 text-sm text-gray-800">
        <img
          src={imageUrl}
          alt={`${displayName} 프로필 이미지`}
          className="h-24 w-24 rounded-full border border-slate-200 object-cover object-center"
          loading="lazy"
          decoding="async"
        />

        <div className="space-y-1 text-center">
          <p className="text-lg font-bold text-slate-900">
            {displayName}
            {participant.username ? ` (${participant.username})` : ""}
          </p>
          <p>
            {participant.age ? `${participant.age}세` : "나이 미등록"} ·{" "}
            {participant.gender?.toLowerCase() === "male" ? "남성" : "여성"}
          </p>
          <p>
            {participant.mbti || "MBTI 미등록"} · {participant.job || "직업 미등록"}
          </p>
          <p>{participant.region || "지역 미등록"}</p>
        </div>

        {participant.introduce && (
          <div className="mt-2 w-full rounded-xl bg-slate-50 p-4 text-sm text-slate-700 shadow-inner">
            <h4 className="mb-2 font-semibold text-slate-900">자기소개</h4>
            <p className="whitespace-pre-line">{participant.introduce}</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="rounded-lg bg-slate-600 px-6 py-2 text-white transition hover:bg-slate-700"
        >
          닫기
        </button>
      </div>
    </BaseModal>
  );
};

export default ParticipantDetailModal;
