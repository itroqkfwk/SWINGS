import { useCallback, useEffect, useState } from "react";
import BaseModal from "./ui/BaseModal";
import {
  getAcceptedParticipants,
  getPendingParticipants,
} from "../api/matchParticipantApi";
import useMatchGroupActions from "../hooks/useMatchGroupActions";
import { getCurrentUser } from "../api/matchGroupApi";
import PendingUserList from "./PendingUserList";
import AcceptedUserList from "./AcceptedUserList";

export default function GroupManageModal({ matchGroupId, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [acceptedParticipants, setAcceptedParticipants] = useState([]);
  const [pendingParticipants, setPendingParticipants] = useState([]);
  const [error, setError] = useState("");

  const {
    handleApprove: approveParticipant,
    handleReject: rejectParticipant,
    handleKick: kickParticipant,
  } = useMatchGroupActions(matchGroupId, currentUser);

  const fetchParticipants = useCallback(async () => {
    try {
      const [user, accepted, pending] = await Promise.all([
        getCurrentUser(),
        getAcceptedParticipants(matchGroupId),
        getPendingParticipants(matchGroupId),
      ]);

      setCurrentUser(user);
      setAcceptedParticipants(accepted);
      setPendingParticipants(pending);
      setError("");
    } catch (loadError) {
      console.error("참가자 목록을 불러오지 못했습니다.", loadError);
      setError("참가자 목록을 불러오지 못했습니다.");
    }
  }, [matchGroupId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const runAction = async (action, failureMessage) => {
    try {
      setError("");
      await action();
      await fetchParticipants();
    } catch (actionFailure) {
      console.error(failureMessage, actionFailure);
      setError(failureMessage);
    }
  };

  return (
    <BaseModal title="참가자 관리" onClose={onClose} maxWidth="max-w-2xl">
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="mb-6">
        <h3 className="mb-3 text-base font-semibold text-gray-800">
          대기 중인 참가자
        </h3>
        <PendingUserList
          pending={pendingParticipants}
          onApprove={(participant) =>
            runAction(
              () => approveParticipant(undefined, participant.matchParticipantId),
              "참가 승인에 실패했습니다."
            )
          }
          onReject={(participant) =>
            runAction(
              () => rejectParticipant(undefined, participant.matchParticipantId),
              "참가 거절에 실패했습니다."
            )
          }
        />
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-gray-800">
          확정 참가자 목록
        </h3>
        <AcceptedUserList
          participants={acceptedParticipants}
          currentUserId={currentUser?.userId}
          onRemove={(participant) =>
            runAction(
              () => kickParticipant(undefined, participant.userId),
              "참가자 강퇴에 실패했습니다."
            )
          }
        />
      </section>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-gray-500 px-6 py-2 text-sm text-white transition hover:bg-gray-600 sm:w-auto"
        >
          닫기
        </button>
      </div>
    </BaseModal>
  );
}
