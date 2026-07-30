import { useMemo } from "react";

const useMatchStatus = (group, currentUser, participants, pendingParticipants) => {
    return useMemo(() => {
        const currentUserId = currentUser?.userId;
        const acceptedParticipants = participants ?? [];
        const pending = pendingParticipants ?? [];
        const hasCurrentUser = (participant) =>
            String(participant?.userId) === String(currentUserId);

        return {
            isHost:
                currentUserId != null &&
                String(group?.hostId) === String(currentUserId),
            isFull:
                Number.isFinite(Number(group?.maxParticipants)) &&
                acceptedParticipants.length >= Number(group.maxParticipants),
            isParticipant:
                currentUserId != null && acceptedParticipants.some(hasCurrentUser),
            isPending: currentUserId != null && pending.some(hasCurrentUser),
            isRecruitClosed: Boolean(group?.closed),
        };
    }, [group, currentUser, participants, pendingParticipants]);
};

export default useMatchStatus;
