import BaseModal from "./ui/BaseModal";
import PendingUserList from "./PendingUserList.jsx";

const PendingParticipantModal = ({
                                     isOpen,
                                     onClose,
                                     pendingParticipants,
                                     onApprove,
                                     onReject,
}) => {
    if (!isOpen) return null;

    return (
        <BaseModal onClose={onClose} title="⏳ 대기 중인 참가자">
            <PendingUserList
                pending={pendingParticipants}
                onApprove={(participant) =>
                    onApprove(participant.matchParticipantId)
                }
                onReject={(participant) =>
                    onReject(participant.matchParticipantId)
                }
                showDetail={false}
            />
        </BaseModal>
    );
};

export default PendingParticipantModal;
