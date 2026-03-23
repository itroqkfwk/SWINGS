import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarIcon,
  MapPinIcon,
  Mars,
  UsersIcon,
  Venus,
} from "lucide-react";
import { getCurrentUser, getMatchGroupById } from "../api/matchGroupApi";
import {
  getAcceptedParticipants,
  getPendingParticipants,
} from "../api/matchParticipantApi";
import PendingParticipantModal from "../components/PendingParticipantModal";
import useMatchGroupActions from "../hooks/useMatchGroupActions";
import useMatchStatus from "../hooks/useMatchStatus";
import JoinConfirmModal from "../components/JoinConfirmModal";

const MatchGroupDetail = () => {
  const { matchGroupId } = useParams();

  const [group, setGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pendingParticipants, setPendingParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { isHost, isParticipant, isFull } = useMatchStatus(
    group,
    currentUser,
    participants,
    pendingParticipants
  );

  const fetchGroupData = async () => {
    try {
      const user = await getCurrentUser();
      const groupData = await getMatchGroupById(matchGroupId);
      const accepted = await getAcceptedParticipants(matchGroupId);
      const pending = await getPendingParticipants(matchGroupId);

      setCurrentUser(user);
      setGroup(groupData);
      setParticipants(accepted);
      setPendingParticipants(pending);
    } catch (error) {
      console.error("데이터 로딩 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    const interval = setInterval(fetchGroupData, 5000);
    return () => clearInterval(interval);
  }, [matchGroupId]);

  const {
    handleJoin,
    handleLeave,
    handleApprove,
    handleReject,
    handleRemoveParticipant,
    handleCloseGroup,
    handleDeleteGroup,
  } = useMatchGroupActions(
    group,
    currentUser,
    fetchGroupData,
    participants,
    setParticipants
  );

  const handleConfirmJoin = async () => {
    await handleJoin();
    setShowJoinModal(false);
  };

  const femaleCount = participants.filter((p) => p.gender === "female").length;
  const maleCount = participants.filter((p) => p.gender === "male").length;

  const genderLimitReached =
    (currentUser?.gender === "female" && femaleCount >= group?.femaleLimit) ||
    (currentUser?.gender === "male" && maleCount >= group?.maleLimit);

  if (loading) {
    return <p className="text-center">그룹 정보를 불러오는 중...</p>;
  }

  if (!group) {
    return (
      <p className="text-center text-red-500">
        그룹 정보를 불러올 수 없습니다.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">{group.groupName}</h1>
        <p className="mb-4 text-gray-600">{group.description}</p>

        <div className="mb-5 space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-pink-500" />
            <span>{group.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-orange-500" />
            <span>{new Date(group.schedule).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-purple-500" />
            <span>
              {participants.length}/{group.maxParticipants}명 모집 중
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Venus className="h-4 w-4 text-pink-500" />
              <span>여자 {femaleCount}/{group.femaleLimit}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mars className="h-4 w-4 text-blue-500" />
              <span>남자 {maleCount}/{group.maleLimit}</span>
            </div>
          </div>
          <div>
            <span className="font-semibold">상태:</span>{" "}
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs text-white ${
                group.status === "모집중" ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              {group.status}
            </span>
          </div>
        </div>

        {!isParticipant ? (
          <button
            onClick={() => setShowJoinModal(true)}
            className={`mt-4 w-full rounded-xl px-4 py-2 font-bold text-white shadow-md transition ${
              isFull || genderLimitReached
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-custom-pink hover:bg-pink-400"
            }`}
            disabled={isFull || genderLimitReached}
          >
            {isFull
              ? "모집 완료"
              : genderLimitReached
              ? "성비 제한으로 요청 불가"
              : "참가 요청"}
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="mt-4 w-full rounded-lg bg-red-500 px-4 py-2 text-white shadow-md transition hover:bg-red-600"
          >
            참가 취소
          </button>
        )}

        {isHost && (
          <div className="mt-6 space-y-2">
            <button
              onClick={handleCloseGroup}
              className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white shadow-md transition hover:bg-yellow-600"
            >
              모집 종료
            </button>
            <button
              onClick={handleDeleteGroup}
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white shadow-md transition hover:bg-gray-800"
            >
              그룹 삭제
            </button>
            {pendingParticipants.length > 0 && (
              <button
                onClick={() => setShowPendingModal(true)}
                className="w-full rounded-lg bg-green-500 px-4 py-2 text-white shadow-md transition hover:bg-green-600"
              >
                대기자 목록 보기 ({pendingParticipants.length})
              </button>
            )}
          </div>
        )}

        <div className="mt-6">
          <h2 className="mb-1 text-lg font-semibold">참가자 목록</h2>
          {participants.length === 0 ? (
            <p className="text-gray-500">아직 참가자가 없습니다.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {participants.map((participant) => (
                <li
                  key={participant.userId}
                  className="flex items-center justify-between rounded bg-gray-100 p-2"
                >
                  <span>
                    {participant.username}
                    {participant.userId === group.hostId && (
                      <span className="ml-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs text-white">
                        방장
                      </span>
                    )}
                  </span>
                  {isHost && participant.userId !== currentUser?.userId && (
                    <button
                      onClick={() =>
                        handleRemoveParticipant(
                          group.matchGroupId,
                          participant.userId,
                          currentUser.userId
                        )
                      }
                      className="rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                    >
                      강퇴
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <PendingParticipantModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        pendingParticipants={pendingParticipants}
        onApprove={(matchParticipantId) =>
          handleApprove(group.matchGroupId, matchParticipantId, currentUser.userId)
        }
        onReject={(matchParticipantId) =>
          handleReject(group.matchGroupId, matchParticipantId, currentUser.userId)
        }
      />

      <JoinConfirmModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        group={group}
        participants={participants}
        onConfirm={handleConfirmJoin}
      />
    </div>
  );
};

export default MatchGroupDetail;
