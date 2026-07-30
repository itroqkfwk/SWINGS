import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  LogOut,
  Settings,
  KeyRound,
  Trash2,
  Shield,
  Pencil,
  X,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import {
  fetchUserData,
  getPointBalance,
  getProfileImageUrl,
  updateUserInfo,
} from "../api/userApi";
import { removeToken } from "../utils/userUtils";
import IntroduceEditor from "../components/IntroduceEditor";
import ProfileImageUploader from "../components/ProfileImageUploader";
import PasswordChangeForm from "../components/PasswordChangeForm";
import DeleteUserModal from "../components/DeleteUserModal";
import { toast } from "react-toastify";
import { IoIosArrowBack } from "react-icons/io";

export default function MyPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [point, setPoint] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserData();
        setFormData(data);
        const balance = await getPointBalance();
        setPoint(balance);
      } catch (err) {
        console.error("사용자 정보 또는 포인트를 불러오지 못했습니다.", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/swings");
  };

  if (loading) {
    return (
      <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-5xl items-center justify-center px-4 text-sm font-medium text-slate-400">
        마이페이지를 불러오는 중입니다.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-1 pb-8 sm:px-2">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/swings/social")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="뒤로 가기"
          >
            <IoIosArrowBack size={20} />
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              My Page
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
              마이페이지
            </h1>
          </div>

          <div className="h-11 w-11" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-rose-50/40 to-slate-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                className="group relative"
                onClick={() => setShowImageModal(true)}
                title="프로필 이미지 수정"
              >
                {formData?.userImg ? (
                  <img
                    src={getProfileImageUrl(formData.userImg)}
                    alt="프로필 이미지"
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition group-hover:brightness-95"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition group-hover:brightness-95">
                    <UserCircle className="text-slate-300" size={88} />
                  </div>
                )}

                <div className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-lg transition group-hover:scale-105">
                  <Pencil size={15} />
                </div>
              </button>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                {formData?.username}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                내 프로필과 계정 설정을 관리해보세요.
              </p>

              {formData?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => navigate("/swings/admin")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-200"
                >
                  <Shield size={16} />
                  관리자 페이지
                </button>
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Point Wallet
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">
                  보유 포인트
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  포인트 내역과 충전 현황을 확인할 수 있어요.
                </p>
              </div>

              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Coins size={20} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/swings/points")}
              className="mt-6 flex w-full items-center justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Available
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {point.toLocaleString()}
                </p>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </button>
          </section>
        </div>

        {formData && (
          <section className="mt-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Profile Message
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  프로필 메시지
                </h3>
              </div>
            </div>

            <IntroduceEditor
              initialText={formData.introduce || ""}
              onSave={async (newText) => {
                try {
                  await updateUserInfo(formData.userId, newText);
                  setFormData({ ...formData, introduce: newText });
                  toast.success("자기소개가 저장되었습니다.");
                } catch {
                  toast.error("자기소개 저장에 실패했습니다.");
                }
              }}
            />
          </section>
        )}

        <section className="mt-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="space-y-3">
            <LineAction
              icon={<Settings size={18} />}
              text="회원정보 수정"
              description="프로필과 기본 계정 정보를 수정합니다."
              onClick={() => navigate("/swings/mypage/update")}
            />
            <LineAction
              icon={<KeyRound size={18} />}
              text="비밀번호 변경"
              description="안전한 계정 관리를 위해 비밀번호를 변경합니다."
              onClick={() => setShowPasswordModal(true)}
            />
            <LineAction
              icon={<Trash2 size={18} />}
              text="회원 탈퇴"
              description="계정을 삭제하고 서비스를 탈퇴합니다."
              textColor="text-red-500"
              onClick={() => setShowDeleteModal(true)}
            />
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 pt-24 pb-28">
          <ProfileImageUploader
            imageFile={imageFile}
            setImageFile={setImageFile}
            initialImage={formData?.userImg}
            onClose={() => setShowImageModal(false)}
            onComplete={(filename) =>
              setFormData({ ...formData, userImg: filename || null })
            }
          />
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 pt-24 pb-28">
          <div className="relative max-h-[calc(100vh-10rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-900"
            >
              <X size={20} />
            </button>
            <PasswordChangeForm isModal />
          </div>
        </div>
      )}

      {showDeleteModal && <DeleteUserModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}

function LineAction({
  icon,
  text,
  description,
  onClick,
  textColor = "text-slate-700",
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50 ${textColor}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div className="min-w-0">
            <div className="text-sm font-bold">{text}</div>
            <p className="mt-1 text-xs font-medium text-slate-400">{description}</p>
          </div>
        </div>
        <ChevronRight className="shrink-0 text-slate-300" size={18} />
      </div>
    </button>
  );
}
