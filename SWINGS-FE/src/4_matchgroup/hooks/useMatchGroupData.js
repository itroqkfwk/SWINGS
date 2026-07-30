import { useCallback, useState } from "react";
import { getAcceptedParticipants } from "../api/matchParticipantApi";
import { getCurrentUser, getMatchGroupById } from "../api/matchGroupApi";
import { getChatMessagesByGroupId } from "../api/matchGroupChatApi";

export const useMatchGroupData = (matchGroupId) => {
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [group, setGroup] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async ({ showLoading = true } = {}) => {
        if (showLoading) {
            setLoading(true);
        }
        setError(null);

        try {
            const [user, accepted, groupInfo] = await Promise.all([
                getCurrentUser(),
                getAcceptedParticipants(matchGroupId),
                getMatchGroupById(matchGroupId),
            ]);

            const isAccepted =
                accepted.some(
                    (participant) =>
                        String(participant.userId) === String(user.userId)
                ) || String(user.userId) === String(groupInfo.hostId);

            setCurrentUser(user);
            setParticipants(accepted);
            setGroup(groupInfo);
            setIsAuthorized(isAccepted);

            if (!isAccepted) {
                return [];
            }

            return await getChatMessagesByGroupId(matchGroupId);
        } catch (loadError) {
            console.error("그룹 정보를 불러오지 못했습니다.", loadError);
            setIsAuthorized(false);
            setError(loadError);
            throw loadError;
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [matchGroupId]);

    return {
        participants,
        currentUser,
        group,
        isAuthorized,
        loading,
        error,
        fetchData,
    };
};
