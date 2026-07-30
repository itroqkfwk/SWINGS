import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import {
  CalendarIcon,
  Crown,
  MapPinIcon,
  Mars,
  Menu,
  UsersIcon,
  Venus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getProfileImageUrl } from "../../1_user/api/userApi";
import ParticipantDetailModal from "../components/ParticipantDetailModal";
import PendingUserList from "../components/PendingUserList";
import AcceptedUserList from "../components/AcceptedUserList";
import {
  getAcceptedParticipants,
  getPendingParticipants,
} from "../api/matchParticipantApi";
import { useMatchGroupData } from "../hooks/useMatchGroupData";
import { useMatchGroupChat } from "../hooks/useMatchGroupChat";
import useMatchGroupActions from "../hooks/useMatchGroupActions";

export default function MatchGroup() {
  const { matchGroupId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  const {
    participants,
    currentUser,
    group,
    isAuthorized,
    loading,
    error,
    fetchData,
  } = useMatchGroupData(matchGroupId);

  const { messages, setMessages, chatInput, setChatInput, sendMessage } =
    useMatchGroupChat(matchGroupId, isAuthorized, currentUser);

  const {
    handleApprove: approveParticipant,
    handleReject: rejectParticipant,
    handleKick: kickParticipant,
    handleLeaveAccepted: leaveAcceptedGroup,
  } = useMatchGroupActions(matchGroupId, currentUser);

  const refreshGroupData = useCallback(
    async ({ showLoading = false } = {}) => {
      const initialMessages = await fetchData({ showLoading });
      setMessages(initialMessages ?? []);
    },
    [fetchData, setMessages]
  );

  useEffect(() => {
    refreshGroupData({ showLoading: true }).catch(() => undefined);
  }, [refreshGroupData]);

  useEffect(() => {
    if (!showPendingModal) {
      return;
    }

    getPendingParticipants(matchGroupId)
      .then(setPendingUsers)
      .catch((loadError) => {
        console.error("대기자 목록을 불러오지 못했습니다.", loadError);
        setActionError("대기자 목록을 불러오지 못했습니다.");
      });
  }, [matchGroupId, showPendingModal]);

  useEffect(() => {
    if (!showAcceptedModal) {
      return;
    }

    getAcceptedParticipants(matchGroupId)
      .then(setAcceptedUsers)
      .catch((loadError) => {
        console.error("참가자 목록을 불러오지 못했습니다.", loadError);
        setActionError("참가자 목록을 불러오지 못했습니다.");
      });
  }, [matchGroupId, showAcceptedModal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isHost = String(currentUser?.userId) === String(group?.hostId);

  const participantCountLabel = useMemo(() => {
    if (!group) {
      return "";
    }

    return `${participants.length}/${group.maxParticipants}명 참여 중`;
  }, [group, participants.length]);

  const refreshParticipants = async () => {
    const [pending, accepted] = await Promise.all([
      getPendingParticipants(matchGroupId),
      getAcceptedParticipants(matchGroupId),
    ]);
    setPendingUsers(pending);
    setAcceptedUsers(accepted);
  };

  const handleApprove = async (participant) => {
    try {
      setActionError("");
      await approveParticipant(undefined, participant.matchParticipantId);
      await refreshParticipants();
      await refreshGroupData();
    } catch (actionFailure) {
      console.error("참가 승인에 실패했습니다.", actionFailure);
      setActionError("참가 승인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleReject = async (participant) => {
    try {
      setActionError("");
      await rejectParticipant(undefined, participant.matchParticipantId);
      await refreshParticipants();
      await refreshGroupData();
    } catch (actionFailure) {
      console.error("참가 거절에 실패했습니다.", actionFailure);
      setActionError("참가 거절에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleKick = async (participant) => {
    if (!window.confirm(`${participant.username}님을 강퇴하시겠습니까?`)) {
      return;
    }

    try {
      setActionError("");
      await kickParticipant(undefined, participant.userId);
      await refreshParticipants();
      await refreshGroupData();
    } catch (actionFailure) {
      console.error("참가자 강퇴에 실패했습니다.", actionFailure);
      setActionError("참가자 강퇴에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || !currentUser || isLeaving) {
      return;
    }

    setIsLeaving(true);
    setActionError("");

    try {
      await leaveAcceptedGroup();
      setShowLeaveConfirm(false);
      navigate(
        group.matchType
          ? `/swings/matchgroup/${group.matchType}`
          : "/swings/matchgroup"
      );
    } catch (actionFailure) {
      console.error("그룹 나가기에 실패했습니다.", actionFailure);
      setActionError("그룹 나가기에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        그룹 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-semibold text-red-500">
          그룹 정보를 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() =>
            refreshGroupData({ showLoading: true }).catch(() => undefined)
          }
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-10 text-center font-semibold text-red-500">
        이 그룹에 입장할 권한이 없습니다.
      </div>
    );
  }

  if (!group || !currentUser) {
    return (
      <div className="p-10 text-center text-slate-500">
        그룹 정보를 불러오는 중입니다...
      </div>
    );
  }

  const renderGenderIcon = (gender) =>
    gender?.toLowerCase() === "male" ? (
      <Mars className="h-4 w-4 text-blue-500" />
    ) : (
      <Venus className="h-4 w-4 text-pink-500" />
    );

  const formatKoreanDate = (isoString) => {
    if (!isoString) {
      return "";
    }

    return format(new Date(isoString), "yyyy년 M월 d일 a h:mm", {
      locale: ko,
    });
  };

  const ParticipantSidebar = (
    <div className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">참가자 목록</h2>
        <button
          type="button"
          onClick={() => setShowSidebar(false)}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="참가자 목록 닫기"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
        {participants.map((participant) => (
          <li
            key={participant.matchParticipantId ?? participant.userId}
            onClick={() => {
              setSelectedParticipant(participant);
              setShowDetailModal(true);
            }}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    participant.userImg
                      ? getProfileImageUrl(participant.userImg)
                      : "/default-profile.png"
                  }
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover object-center"
                  alt={`${participant.username} 프로필`}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">
                      {participant.username}
                    </span>
                    {renderGenderIcon(participant.gender)}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    {String(participant.userId) === String(group.hostId) && (
                      <span className="inline-flex items-center gap-1 text-yellow-600">
                        <Crown className="h-3 w-3" />
                        방장
                      </span>
                    )}
                    {String(participant.userId) === String(currentUser.userId) && (
                      <span className="text-blue-500">나</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        {isHost && (
          <>
            <button
              type="button"
              onClick={() => setShowPendingModal(true)}
              className="rounded-xl bg-custom-pink px-3 py-2.5 font-semibold text-white"
            >
              참가 요청 관리
            </button>
            <button
              type="button"
              onClick={() => setShowAcceptedModal(true)}
              className="rounded-xl bg-custom-purple px-3 py-2.5 font-semibold text-white"
            >
              참가 인원 관리
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setShowLeaveConfirm(true)}
          className="rounded-xl border border-red-300 px-3 py-2.5 font-semibold text-red-500 transition hover:bg-red-50"
        >
          그룹 나가기
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/swings/matchgroup")}
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="모임 목록으로 돌아가기"
          >
            <IoIosArrowBack size={24} />
          </button>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-lg font-bold text-slate-900">
              {group.groupName}
            </h1>
            <p className="text-xs text-slate-500">{participantCountLabel}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="참가자 목록 열기"
          >
            <Menu size={22} />
          </button>

          <div className="hidden w-10 lg:block" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{ParticipantSidebar}</aside>

        <main className="grid gap-5 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base leading-7 text-slate-600">
              {group.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                {group.playStyle}
              </span>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                {group.ageRange}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {group.matchType}
              </span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              <InfoItem
                icon={<CalendarIcon className="h-4 w-4 text-orange-500" />}
                text={formatKoreanDate(group.schedule)}
              />
              <InfoItem
                icon={<MapPinIcon className="h-4 w-4 text-pink-500" />}
                text={
                  <a
                    href={`https://map.kakao.com/link/map/${encodeURIComponent(
                      group.location
                    )},${group.latitude},${group.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {group.location}
                  </a>
                }
              />
              <InfoItem
                icon={<UsersIcon className="h-4 w-4 text-purple-500" />}
                text={participantCountLabel}
              />
            </div>
          </section>

          <section className="flex min-h-[60vh] flex-col rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">그룹 채팅</h2>
              <p className="mt-1 text-sm text-slate-500">
                참가자들과 일정과 장소를 편하게 상의해보세요.
              </p>
            </div>

            {actionError && (
              <p
                role="alert"
                className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {actionError}
              </p>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
              {messages.length === 0 ? (
                <p className="pt-10 text-center text-sm text-slate-400">
                  아직 메시지가 없습니다.
                </p>
              ) : (
                messages.map((message, idx) => {
                  const isMine = message.sender === currentUser.username;
                  return (
                    <div
                      key={`${message.sentAt ?? "msg"}-${idx}`}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isMine
                            ? "bg-pink-500 text-white"
                            : "bg-white text-slate-700"
                        }`}
                      >
                        <p className="mb-1 text-xs font-semibold opacity-80">
                          {message.sender}
                        </p>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="메시지를 입력하세요."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-pink-300"
              />
              <button
                type="submit"
                className="rounded-xl bg-custom-pink px-5 py-3 font-semibold text-white"
              >
                보내기
              </button>
            </form>
          </section>
        </main>
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="h-full w-[320px] max-w-[88vw] bg-white p-4 shadow-xl">
            {ParticipantSidebar}
          </div>
        </div>
      )}

      {showDetailModal && (
        <ParticipantDetailModal
          isOpen={showDetailModal}
          participant={selectedParticipant}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              정말 그룹에서 나가시겠습니까?
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              {isHost
                ? "방장이 나가면 그룹과 참가자 정보가 함께 삭제됩니다."
                : "나가면 그룹 채팅에 다시 입장할 수 없습니다."}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="rounded-lg bg-red-500 px-4 py-2 text-white disabled:bg-red-300"
              >
                {isLeaving ? "나가는 중..." : "나가기"}
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={isLeaving}
                className="rounded-lg bg-gray-200 px-4 py-2 text-slate-700 disabled:opacity-60"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-center text-lg font-bold text-slate-900">
              참가 요청 관리
            </h3>
            <PendingUserList
              pending={pendingUsers}
              onApprove={handleApprove}
              onReject={handleReject}
            />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showAcceptedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-center text-lg font-bold text-slate-900">
              참가 인원 관리
            </h3>
            <AcceptedUserList
              participants={acceptedUsers}
              currentUserId={currentUser.userId}
              onRemove={handleKick}
            />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowAcceptedModal(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, text }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      {icon}
      <span>{text}</span>
    </p>
  );
}
