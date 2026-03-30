import { useState } from "react";
import ParticipantDetailModal from "./ParticipantDetailModal.jsx";
import { getProfileImageUrl } from "../../1_user/api/userApi";

const AcceptedUserList = ({ participants, currentUserId, onRemove }) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  if (!participants.length) {
    return <p className="text-sm text-gray-500">참가자가 없습니다.</p>;
  }

  return (
    <>
      <ul className="space-y-3">
        {participants.map((p) => (
          <li
            key={p.matchParticipantId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setSelectedParticipant(p)}
            >
              <img
                src={
                  p.userImg ? getProfileImageUrl(p.userImg) : "/default-profile.png"
                }
                alt={`${p.username ?? "참가자"} 프로필`}
                className="h-11 w-11 rounded-full border border-slate-200 object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {p.username ?? `ID: ${p.userId}`}
                </span>
                {p.userId === currentUserId && (
                  <span className="inline-flex rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">
                    방장
                  </span>
                )}
              </div>
            </button>

            {p.userId !== currentUserId && (
              <button
                onClick={() => onRemove(p)}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                강퇴
              </button>
            )}
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

export default AcceptedUserList;
