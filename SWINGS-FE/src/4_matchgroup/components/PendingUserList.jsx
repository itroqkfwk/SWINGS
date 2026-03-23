import { useState } from "react";
import ParticipantDetailModal from "./ParticipantDetailModal.jsx";
import { getProfileImageUrl } from "../../1_user/api/userApi";

const PendingUserList = ({
  pending,
  onApprove,
  onReject,
  showDetail = true,
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  if (!pending.length) {
    return <p className="text-sm text-gray-500">대기자가 없습니다.</p>;
  }

  return (
    <>
      <ul className="space-y-3">
        {pending.map((p) => (
          <li
            key={p.matchParticipantId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => showDetail && setSelectedParticipant(p)}
            >
              <img
                src={
                  p.userImg ? getProfileImageUrl(p.userImg) : "/default-profile.png"
                }
                alt={`${p.username ?? "대기자"} 프로필`}
                className="h-11 w-11 rounded-full border border-slate-200 object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <span className="text-sm font-medium text-slate-700">
                {p.username ?? `ID: ${p.userId}`}
              </span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onApprove(p)}
                className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                승인
              </button>
              <button
                onClick={() => onReject(p)}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                거절
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ParticipantDetailModal
        isOpen={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        participant={selectedParticipant}
      />
    </>
  );
};

export default PendingUserList;
