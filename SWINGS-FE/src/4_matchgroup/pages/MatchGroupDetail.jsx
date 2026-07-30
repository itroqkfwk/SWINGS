import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pendingParticipants, setPendingParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchGroupData = useCallback(
    async ({ showLoading = false } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const [user, groupData, accepted] = await Promise.all([
          getCurrentUser(),
          getMatchGroupById(matchGroupId),
          getAcceptedParticipants(matchGroupId),
        ]);
        const pending =
          String(user.userId) === String(groupData.hostId)
            ? await getPendingParticipants(matchGroupId)
            : [];

        setCurrentUser(user);
        setGroup(groupData);
        setParticipants(accepted);
        setPendingParticipants(pending);
        setLoadError("");
        return true;
      } catch (error) {
        console.error("모임 데이터를 불러오지 못했습니다.", error);
        setLoadError("모임 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        return false;
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [matchGroupId]
  );

  useEffect(() => {
    fetchGroupData({ showLoading: true });
    const interval = setInterval(fetchGroupData, 5000);

    return () => clearInterval(interval);
  }, [fetchGroupData]);

  const {
    handleJoin: requestJoin,
    handleLeave: cancelJoinRequest,
    handleLeaveAccepted: leaveAcceptedGroup,
    handleApprove: approveParticipant,
    handleReject: rejectParticipant,
    handleKick: kickParticipant,
    handleCloseRecruitment,
    handleDeleteGroup,
  } = useMatchGroupActions(matchGroupId, currentUser);

  const {
    isHost,
    isParticipant,
    isPending,
    isFull,
    isRecruitClosed,
  } = useMatchStatus(group, currentUser, participants, pendingParticipants);

  const runAction = async (
    action,
    failureMessage,
    { refresh = true } = {}
  ) => {
    setActionError("");

    try {
      await action();
      if (refresh) {
        await fetchGroupData();
      }
      return true;
    } catch (error) {
      console.error(failureMessage, error);
      setActionError(failureMessage);
      return false;
    }
  };

  const handleConfirmJoin = async () => {
    const joined = await runAction(
      () => requestJoin(),
      "참가 신청에 실패했습니다. 모집 상태를 확인한 뒤 다시 시도해주세요."
    );

    if (joined) {
      setShowJoinModal(false);
    }
  };

  const handleCancelJoinRequest = () =>
    runAction(
      () => cancelJoinRequest(),
      "참가 신청 취소에 실패했습니다."
    );

  const handleLeaveAcceptedGroup = async () => {
    const message = isHost
      ? "방장이 그룹을 나가면 그룹과 참가자 정보가 삭제됩니다. 계속하시겠습니까?"
      : "정말 그룹에서 나가시겠습니까?";

    if (!window.confirm(message)) {
      return;
    }

    const left = await runAction(
      () => leaveAcceptedGroup(),
      "그룹 나가기에 실패했습니다.",
      { refresh: false }
    );

    if (left) {
      navigate(
        group?.matchType
          ? `/swings/matchgroup/${group.matchType}`
          : "/swings/matchgroup"
      );
    }
  };

  const handleKickParticipant = async (participant) => {
    if (!window.confirm(`${participant.username}님을 강퇴하시겠습니까?`)) {
      return;
    }

    await runAction(
      () => kickParticipant(group.matchGroupId, participant.userId),
      "참가자 강퇴에 실패했습니다."
    );
  };

  const handleDelete = async () => {
    if (!window.confirm("이 그룹을 삭제하시겠습니까?")) {
      return;
    }

    const deleted = await runAction(
      () => handleDeleteGroup(),
      "그룹 삭제에 실패했습니다.",
      { refresh: false }
    );

    if (deleted) {
      navigate(
        group?.matchType
          ? `/swings/matchgroup/${group.matchType}`
          : "/swings/matchgroup"
      );
    }
  };

  const femaleCount = participants.filter(
    (participant) => participant.gender?.toUpperCase() === "FEMALE"
  ).length;
  const maleCount = participants.filter(
    (participant) => participant.gender?.toUpperCase() === "MALE"
  ).length;
  const currentUserGender = currentUser?.gender?.toUpperCase();

  const genderLimitReached =
    (currentUserGender === "FEMALE" &&
      femaleCount >= group?.femaleLimit) ||
    (currentUserGender === "MALE" && maleCount >= group?.maleLimit);
  const isJoinUnavailable = isRecruitClosed || isFull || genderLimitReached;

  if (loading) {
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">
        모임 정보를 불러오는 중입니다...
      </p>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-sm text-red-500">
          {loadError || "모임 정보를 불러올 수 없습니다."}
        </p>
        <button
          type="button"
          onClick={() => fetchGroupData({ showLoading: true })}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">{group.groupName}</h1>
        <p className="mb-4 text-gray-600">{group.description}</p>

        {(loadError || actionError) && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {actionError || loadError}
          </p>
        )}

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
              {participants.length}/{group.maxParticipants}명 참여 중
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Venus className="h-4 w-4 text-pink-500" />
              <span>여성 {femaleCount}/{group.femaleLimit}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mars className="h-4 w-4 text-blue-500" />
              <span>남성 {maleCount}/{group.maleLimit}</span>
            </div>
          </div>
          <div>
            <span className="font-semibold">상태:</span>{" "}
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs text-white ${
                isRecruitClosed ? "bg-gray-500" : "bg-green-500"
              }`}
            >
              {isRecruitClosed ? "모집 종료" : "모집 중"}
            </span>
          </div>
        </div>

        {isPending ? (
          <button
            type="button"
            onClick={handleCancelJoinRequest}
            className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100"
          >
            참가 신청 취소
          </button>
        ) : isParticipant ? (
          <button
            type="button"
            onClick={handleLeaveAcceptedGroup}
            className="mt-4 w-full rounded-xl bg-red-500 px-4 py-2 font-bold text-white shadow-md transition hover:bg-red-600"
          >
            {isHost ? "그룹 삭제 후 나가기" : "그룹 나가기"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowJoinModal(true)}
            className={`mt-4 w-full rounded-xl px-4 py-2 font-bold text-white shadow-md transition ${
              isJoinUnavailable
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-custom-pink hover:bg-pink-400"
            }`}
            disabled={isJoinUnavailable}
          >
            {isRecruitClosed
              ? "모집 종료"
              : isFull
              ? "모집 완료"
              : genderLimitReached
              ? "성비 제한으로 요청 불가"
              : "참가 요청"}
          </button>
        )}

        {isHost && (
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() =>
                runAction(
                  () => handleCloseRecruitment(undefined, !isRecruitClosed),
                  "모집 상태 변경에 실패했습니다."
                )
              }
              className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white shadow-md transition hover:bg-yellow-600"
            >
              {isRecruitClosed ? "모집 재개" : "모집 종료"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white shadow-md transition hover:bg-gray-800"
            >
              그룹 삭제
            </button>
            {pendingParticipants.length > 0 && (
              <button
                type="button"
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
                  key={participant.matchParticipantId ?? participant.userId}
                  className="flex items-center justify-between rounded bg-gray-100 p-2"
                >
                  <span>
                    {participant.username}
                    {String(participant.userId) === String(group.hostId) && (
                      <span className="ml-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs text-white">
                        방장
                      </span>
                    )}
                  </span>
                  {isHost &&
                    String(participant.userId) !== String(currentUser?.userId) && (
                      <button
                        type="button"
                        onClick={() => handleKickParticipant(participant)}
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
          runAction(
            () => approveParticipant(undefined, matchParticipantId),
            "참가 승인에 실패했습니다."
          )
        }
        onReject={(matchParticipantId) =>
          runAction(
            () => rejectParticipant(undefined, matchParticipantId),
            "참가 거절에 실패했습니다."
          )
        }
      />

      <JoinConfirmModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        group={{ ...group, currentUserId: currentUser?.userId }}
        participants={participants}
        onConfirm={handleConfirmJoin}
      />
    </div>
  );
};

export default MatchGroupDetail;
