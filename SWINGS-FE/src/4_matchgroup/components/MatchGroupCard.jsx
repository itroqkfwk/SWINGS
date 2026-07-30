import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card.jsx";
import { Badge } from "./ui/Badge.jsx";
import JoinConfirmModal from "./JoinConfirmModal.jsx";
import { getCurrentUser } from "../api/matchGroupApi.js";
import useMatchGroupActions from "../hooks/useMatchGroupActions";
import { getAcceptedParticipants } from "../api/matchParticipantApi";

const MATCH_TYPE_LABEL = {
  screen: "스크린",
  field: "필드",
};

export default function MatchGroupCard({ group }) {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [acceptedParticipants, setAcceptedParticipants] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { handleJoin } = useMatchGroupActions(null, currentUser);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
    getAcceptedParticipants(group.matchGroupId).then(setAcceptedParticipants);
  }, [group.matchGroupId]);

  useEffect(() => {
    if (!currentUser) return;

    const accepted = acceptedParticipants.some(
      (participant) => participant.userId === currentUser.userId
    );
    setIsParticipant(accepted);

    setIsPending(group?.currentUserParticipationStatus === "PENDING");
  }, [acceptedParticipants, currentUser, group?.currentUserParticipationStatus]);

  const genderCount = useMemo(
    () =>
      acceptedParticipants.reduce(
        (acc, participant) => {
          const gender = participant.gender?.toLowerCase();
          if (gender === "female") acc.female += 1;
          if (gender === "male") acc.male += 1;
          return acc;
        },
        { female: 0, male: 0 }
      ),
    [acceptedParticipants]
  );

  const currentUserGender = currentUser?.gender?.toUpperCase();
  const isRecruitClosed = !!group.closed;
  const isFull = acceptedParticipants.length >= group.maxParticipants;
  const genderLimitReached =
    (currentUserGender === "FEMALE" &&
      genderCount.female >= group.femaleLimit) ||
    (currentUserGender === "MALE" && genderCount.male >= group.maleLimit);

  const disableJoin = isRecruitClosed || isFull || genderLimitReached;
  const matchType = MATCH_TYPE_LABEL[group.matchType] ?? group.matchType;

  const recruitLabel = isRecruitClosed
    ? "모집 종료"
    : isFull
    ? "정원 마감"
    : "모집 중";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <CardHeader className="pb-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge variant={group.matchType === "screen" ? "info" : "success"}>
              {matchType}
            </Badge>
            <Badge variant={disableJoin ? "warning" : "success"}>
              {recruitLabel}
            </Badge>
          </div>
          <CardTitle className="line-clamp-1 text-lg font-bold text-slate-900">
            {group.groupName}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm text-slate-500">
            {group.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-pink-500" />
              <span className="truncate">{group.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-orange-500" />
              <span>{formatDate(group.schedule)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-purple-500" />
              <span>
                {acceptedParticipants.length}/{group.maxParticipants}명 참여 중
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">방장</span>
              <span className="truncate">{group.hostUsername}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-1">
          {isParticipant ? (
            <button
              onClick={() =>
                navigate(`/swings/matchgroup/waitingroom/${group.matchGroupId}`)
              }
              className="w-full rounded-xl bg-custom-pink px-4 py-2.5 font-bold text-white transition hover:bg-pink-400"
            >
              그룹 입장
            </button>
          ) : isPending ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-4 py-2.5 font-bold text-gray-500"
            >
              승인 대기 중
            </button>
          ) : (
            <button
              className={`w-full rounded-xl px-4 py-2.5 font-bold text-white transition ${
                disableJoin
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-custom-purple hover:opacity-90"
              }`}
              onClick={() => setShowJoinModal(true)}
              disabled={disableJoin}
            >
              {isRecruitClosed
                ? "모집 종료"
                : isFull
                ? "정원 마감"
                : genderLimitReached
                ? "성비 마감"
                : "참가 요청"}
            </button>
          )}
        </CardFooter>
      </Card>

      <JoinConfirmModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        group={{ ...group, currentUserId: currentUser?.userId }}
        participants={acceptedParticipants}
        onConfirm={async () => {
          if (genderLimitReached) {
            alert("성비 제한으로 인해 참가할 수 없습니다.");
            return;
          }
          await handleJoin(group.matchGroupId, currentUser?.userId);
        }}
      />
    </>
  );
}
