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
      <div className="flex h-[calc(100vh-128px)] items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white px-4 py-8">
      <button
        onClick={() => navigate("/swings/social")}
        className="absolute left-4 top-4 z-10 rounded-full bg-white p-2 transition"
        aria-label="뒤로가기"
      >
        <IoIosArrowBack size={20} className="text-gray-600" />
      </button>

      <div className="mb-8 flex flex-col items-center text-center font-bold">
        <div
          className="group relative h-24 w-24 cursor-pointer"
          onClick={() => setShowImageModal(true)}
          title="프로필 이미지 수정"
        >
          {formData?.userImg ? (
            <img
              src={getProfileImageUrl(formData.userImg)}
              alt="프로필"
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md transition group-hover:brightness-95"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-100 shadow-md transition group-hover:brightness-95">
              <UserCircle className="text-gray-300" size={80} />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 rounded-full border bg-white p-1 shadow transition group-hover:scale-105">
            <Pencil size={16} className="text-gray-600" />
          </div>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-800">
          {formData?.username}
        </h2>
      </div>

      {formData && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-bold text-gray-500">프로필 메시지</div>
          <IntroduceEditor
            initialText={formData.introduce || ""}
            onSave={async (newText) => {
              try {
                await updateUserInfo(formData.userId, newText);
                setFormData({ ...formData, introduce: newText });
                toast.success("자기소개가 저장되었습니다.");
              } catch (err) {
                toast.error("자기소개 저장에 실패했습니다.");
              }
            }}
          />
        </div>
      )}

      <div
        className="mb-6 cursor-pointer rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
        onClick={() => navigate("/swings/points")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Coins size={18} className="text-yellow-500" />
            <span className="text-sm font-bold">보유 포인트</span>
          </div>
          <div className="text-lg font-bold text-black">{point.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-3">
        {formData?.role === "admin" && (
          <LineAction
            icon={<Shield size={18} />}
            text="관리자 페이지"
            onClick={() => navigate("/swings/admin")}
          />
        )}
        <LineAction
          icon={<Settings size={18} />}
          text="회원정보 수정"
          onClick={() => navigate("/swings/mypage/update")}
        />
        <LineAction
          icon={<KeyRound size={18} />}
          text="비밀번호 변경"
          onClick={() => setShowPasswordModal(true)}
        />
        <LineAction
          icon={<Trash2 size={18} />}
          text="회원 탈퇴"
          textColor="text-red-500"
          onClick={() => setShowDeleteModal(true)}
        />
      </div>

      <div className="mt-10 text-center text-sm">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-1 text-gray-400 transition hover:text-red-500"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 pt-24 pb-28">
          <ProfileImageUploader
            imageFile={imageFile}
            setImageFile={setImageFile}
            initialImage={formData?.userImg}
            onClose={() => setShowImageModal(false)}
            onComplete={(filename) => setFormData({ ...formData, userImg: filename || null })}
          />
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 pt-24 pb-28">
          <div className="relative max-h-[calc(100vh-10rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
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

function LineAction({ icon, text, onClick, textColor = "text-gray-700" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition hover:bg-gray-50 focus:outline-none ${textColor}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {icon}
          {text}
        </div>
        <span className="text-gray-300">&gt;</span>
      </div>
    </button>
  );
}
