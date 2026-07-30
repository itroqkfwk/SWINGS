import {
    joinMatch,
    leaveMatch,
    leaveAcceptedGroup,
    approveParticipant,
    rejectParticipant,
    removeParticipant,
    canUserJoinGroup,
} from "../api/matchParticipantApi";
import { deleteMatchGroup, updateGroupStatus } from "../api/matchGroupApi";

const useMatchGroupActions = (matchGroupId, currentUser) => {
    const resolveGroupId = (groupId) => groupId ?? matchGroupId;
    const resolveUserId = (userId) => userId ?? currentUser?.userId;

    const requireIds = (groupId, userId) => {
        if (!groupId || !userId) {
            throw new Error("그룹 또는 사용자 정보를 찾을 수 없습니다.");
        }
    };

    // 참가 신청
    const handleJoin = async (groupId, userId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedUserId = resolveUserId(userId);
        requireIds(resolvedGroupId, resolvedUserId);

        const canJoin = await canUserJoinGroup(resolvedGroupId, resolvedUserId);
        if (!canJoin) {
            throw new Error("참가 불가");
        }

        return joinMatch(resolvedGroupId, resolvedUserId);
    };

    // 참가 신청 취소
    const handleLeave = async (groupId, userId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedUserId = resolveUserId(userId);
        requireIds(resolvedGroupId, resolvedUserId);

        return leaveMatch(resolvedGroupId, resolvedUserId);
    };

    // 확정 참가자가 방 나가기 (방장이라면 그룹 삭제 포함)
    const handleLeaveAccepted = async (groupId, userId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedUserId = resolveUserId(userId);
        requireIds(resolvedGroupId, resolvedUserId);

        return leaveAcceptedGroup(resolvedGroupId, resolvedUserId);
    };

    // 참가 승인
    const handleApprove = async (groupId, participantId, hostId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedHostId = resolveUserId(hostId);
        requireIds(resolvedGroupId, resolvedHostId);

        if (!participantId) {
            throw new Error("참가 신청 정보를 찾을 수 없습니다.");
        }

        return approveParticipant(resolvedGroupId, participantId, resolvedHostId);
    };

    // 참가 거절
    const handleReject = async (groupId, participantId, hostId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedHostId = resolveUserId(hostId);
        requireIds(resolvedGroupId, resolvedHostId);

        if (!participantId) {
            throw new Error("참가 신청 정보를 찾을 수 없습니다.");
        }

        return rejectParticipant(resolvedGroupId, participantId, resolvedHostId);
    };

    // 강퇴
    const handleKick = async (groupId, userId, hostId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedUserId = userId;
        const resolvedHostId = resolveUserId(hostId);
        requireIds(resolvedGroupId, resolvedUserId);
        requireIds(resolvedGroupId, resolvedHostId);

        return removeParticipant(resolvedGroupId, resolvedUserId, resolvedHostId);
    };

    // 모집 종료 or 재개
    const handleCloseRecruitment = async (groupId, closed = true) => {
        const resolvedGroupId = resolveGroupId(groupId);
        if (!resolvedGroupId) {
            throw new Error("그룹 정보를 찾을 수 없습니다.");
        }

        return updateGroupStatus(resolvedGroupId, closed);
    };

    // 그룹 삭제
    const handleDeleteGroup = async (groupId, userId) => {
        const resolvedGroupId = resolveGroupId(groupId);
        const resolvedUserId = resolveUserId(userId);
        requireIds(resolvedGroupId, resolvedUserId);

        return deleteMatchGroup(resolvedGroupId, resolvedUserId);
    };

    return {
        handleJoin,
        handleLeave,
        handleLeaveAccepted,
        handleApprove,
        handleReject,
        handleKick,
        handleCloseRecruitment,
        handleDeleteGroup,
    };
};

export default useMatchGroupActions;
