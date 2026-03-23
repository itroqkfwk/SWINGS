import ConfirmModal from "./ConfirmModal";

export default function SwipeModals({
  showConfirmModal,
  setShowConfirmModal,
  showChargeModal,
  setShowChargeModal,
  showSuperChatModal,
  setShowSuperChatModal,
  sendLikeRequest,
  confirmSuperChat,
  navigate,
}) {
  return (
    <>
      {showConfirmModal && (
        <ConfirmModal
          message={`무료 호감을 모두 사용했습니다.\n포인트 1개를 사용해서 계속 진행할까요?`}
          confirmLabel="포인트 사용"
          cancelLabel="다음에"
          onConfirm={() => {
            setShowConfirmModal(false);
            sendLikeRequest(true);
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {showSuperChatModal && (
        <ConfirmModal
          message={`슈퍼챗은 포인트 3개를 사용합니다.\n바로 채팅방을 열까요?`}
          confirmLabel="슈퍼챗 보내기"
          cancelLabel="취소"
          onConfirm={confirmSuperChat}
          onCancel={() => setShowSuperChatModal(false)}
        />
      )}

      {showChargeModal && (
        <ConfirmModal
          message={`포인트가 부족합니다.\n충전 페이지로 이동할까요?`}
          confirmLabel="충전하러 가기"
          cancelLabel="닫기"
          onConfirm={() => {
            setShowChargeModal(false);
            navigate("/swings/points");
          }}
          onCancel={() => setShowChargeModal(false)}
        />
      )}
    </>
  );
}
