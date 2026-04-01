import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, HeartHandshake } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import axios from "../../1_user/api/axiosInstance";
import { IoIosArrowBack } from "react-icons/io";
import {
  getSentAndReceivedLikes,
  sendLikeToUser,
  createChatRoom,
} from "../api/matchApi";
import ConfirmModal from "../components/ConfirmModal";
import { fetchUserData, getProfileImageUrl } from "../../1_user/api/userApi";
import defaultImg from "../../assets/default-profile-optimized.jpg";

export default function LikeListPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("sent");
  const [sentLikes, setSentLikes] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetUsername, setTargetUsername] = useState(null);
  const [modalStep, setModalStep] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchUserData();
        setCurrentUser(user);
      } catch (err) {
        console.error("현재 사용자 정보를 불러오지 못했습니다:", err);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser?.username) {
      fetchData(currentUser.username);
    }
  }, [currentUser]);

  const fetchData = async (username) => {
    try {
      const res = await getSentAndReceivedLikes(username);
      setSentLikes(res.sentLikes || []);
      setReceivedLikes(res.receivedLikes || []);
    } catch (err) {
      console.error("좋아요 목록을 불러오지 못했습니다:", err);
    }
  };

  const handleClickLike = (username) => {
    setTargetUsername(username);
    setModalStep("confirm");
  };

  const handleConfirmLike = async () => {
    if (!currentUser || !targetUsername) return;

    try {
      const res = await axios.get(`/api/likes/count/${currentUser.username}`);
      const remaining = res.data;

      if (remaining > 0) {
        await sendLikeToUser(currentUser.username, targetUsername, false);
        await createChatRoom(currentUser.username, targetUsername, false);
        toast.success("무료 좋아요를 보냈어요.");
        toast.success("채팅방이 생성되었습니다.");
        fetchData(currentUser.username);
        resetModal();
      } else {
        setModalStep("paid");
      }
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
      toast.error("좋아요를 보내는 중 오류가 발생했습니다.");
      resetModal();
    }
  };

  const handleConfirmPaidLike = async () => {
    if (isProcessing || !targetUsername) return;
    setIsProcessing(true);

    try {
      const data = new URLSearchParams();
      data.append("amount", 1);
      data.append("description", "좋아요 유료 사용");

      await axios.post(`/users/me/points/use`, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await createChatRoom(currentUser.username, targetUsername, false);

      toast.success("포인트로 좋아요를 보냈어요.");
      toast.success("채팅방이 생성되었습니다.");
      fetchData(currentUser.username);
      resetModal();
    } catch (err) {
      if (err.response?.status === 400) {
        setModalStep("charge");
      } else {
        console.error("유료 좋아요 처리 실패:", err);
        toast.error("유료 좋아요 처리에 실패했습니다.");
        resetModal();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setModalStep(null);
    setTargetUsername(null);
  };

  const activeList = tab === "sent" ? sentLikes : receivedLikes;

  if (!currentUser) {
    return (
      <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center rounded-[2rem] border border-white/60 bg-white/70 px-6 text-sm text-slate-500 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        좋아요 보관함을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-[0_25px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
      <Toaster />

      {modalStep === "confirm" && (
        <ConfirmModal
          message="이 회원에게 좋아요를 보내시겠어요?"
          confirmLabel="보내기"
          cancelLabel="취소"
          onConfirm={handleConfirmLike}
          onCancel={resetModal}
        />
      )}

      {modalStep === "paid" && (
        <ConfirmModal
          message="무료 좋아요를 모두 사용했어요. 포인트 1개를 사용해 계속 보낼까요?"
          confirmLabel="계속하기"
          cancelLabel="취소"
          onConfirm={handleConfirmPaidLike}
          onCancel={resetModal}
        />
      )}

      {modalStep === "charge" && (
        <ConfirmModal
          message="포인트가 부족합니다.\n충전 페이지로 이동할까요?"
          confirmLabel="충전하러 가기"
          cancelLabel="닫기"
          onConfirm={() => {
            resetModal();
            navigate("/swings/points");
          }}
          onCancel={resetModal}
        />
      )}

      <div className="relative overflow-hidden border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,244,247,0.92)_45%,rgba(239,246,255,0.88))] px-5 py-5 sm:px-7">
        <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-4rem] left-[-2rem] h-36 w-36 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-white/85 p-2 text-slate-600 shadow-sm transition hover:text-slate-900"
            >
              <IoIosArrowBack size={22} />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">
              <Heart className="h-4 w-4 text-rose-400" />
              좋아요 보관함
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-white/80 bg-white/85 px-4 py-3 text-right shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              전체
            </p>
            <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
              {sentLikes.length + receivedLikes.length}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200/60 bg-white/70 px-4 py-4 sm:px-5">
        <div className="flex justify-center gap-3">
          <button
            className={`rounded-2xl px-4 py-2 font-bold transition-all duration-200 ${
              tab === "sent"
                ? "bg-custom-pink text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("sent")}
          >
            보낸 좋아요
          </button>
          <button
            className={`rounded-2xl px-4 py-2 font-bold transition-all duration-200 ${
              tab === "received"
                ? "bg-yellow-400 text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("received")}
          >
            받은 좋아요
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(248,250,252,0.92))] px-3 py-3 sm:px-4 sm:py-4">
        <div className="h-full overflow-y-auto rounded-[1.6rem] border border-white/75 bg-white/75 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:p-3">
          {activeList.length === 0 ? (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-slate-200 bg-white/70 px-6 text-center">
              <HeartHandshake className="h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">
                아직 표시할 좋아요가 없어요.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeList.map((user, index) => {
                const isMutual = String(user.mutual) === "true";

                return (
                  <motion.div
                    key={`${user.username}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between rounded-[1.4rem] bg-white px-4 py-4 shadow-sm transition hover:bg-gray-50"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-4"
                      onClick={() => navigate(`/swings/profile/${user.username}`)}
                    >
                      <img
                        src={
                          user.userImg
                            ? getProfileImageUrl(user.userImg)
                            : defaultImg
                        }
                        alt="프로필"
                        className="h-12 w-12 rounded-full border object-cover"
                      />
                      <div>
                        <p className="text-base font-semibold text-gray-800">
                          {user.name || user.username || "이름 없음"}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{user.username || "unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tab === "received" && !isMutual && (
                        <button
                          disabled={!currentUser || loading}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClickLike(user.username);
                          }}
                          className="rounded-xl bg-custom-pink px-3 py-1 text-sm text-white"
                        >
                          좋아요 보내기
                        </button>
                      )}

                      {isMutual ? (
                        <Heart className="h-5 w-5 fill-custom-pink text-custom-pink" />
                      ) : (
                        <Heart className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
