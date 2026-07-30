import { useState, useEffect } from "react";
import { changePassword, fetchUserData } from "../api/userApi";
import { validatePasswordMatch } from "../utils/userUtils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { removeToken } from "../utils/userUtils";

export default function PasswordChangeForm({ isModal = false }) {
  const [username, setUsername] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const user = await fetchUserData();
        setUsername(user.username);
      } catch (error) {
        console.error("사용자 정보를 조회하지 못했습니다.", error);
        setMessage("로그인이 필요합니다.");
      }
    };

    loadUsername();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const error = validatePasswordMatch(newPassword, confirmPassword);
    if (error) {
      setMessage(error);
      return;
    }

    try {
      await changePassword(username, newPassword);
      setMessage("비밀번호가 변경되었습니다.");
      setNewPassword("");
      setConfirmPassword("");
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      setMessage("비밀번호 변경에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/swings");
  };

  if (!username) {
    return (
      <div className="flex min-h-[150px] items-center justify-center text-sm text-gray-500">
        사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div
      className={`${isModal ? "" : "min-h-screen"} flex flex-col items-center justify-start px-4`}
    >
      {!isModal && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-50 text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      <form
        onSubmit={handleSubmit}
        className={`mt-4 w-full space-y-4 p-2 ${isModal ? "max-w-xs" : "max-w-md"}`}
      >
        <h2 className="mb-3 text-center text-base font-bold text-gray-800">
          비밀번호 변경
        </h2>

        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="w-full rounded border border-gray-300 p-2 text-sm text-black outline-none focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded border border-gray-300 p-2 text-sm text-black outline-none focus:outline-none"
          required
        />

        {message && (
          <p
            className={`text-center text-xs font-bold ${
              message.includes("변경되었습니다") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded bg-custom-pink py-2 text-sm font-bold text-white transition"
        >
          비밀번호 변경
        </button>
      </form>

      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center px-4">
          <Dialog.Panel className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 text-center shadow-lg">
            <Dialog.Title className="text-lg font-bold text-black">
              비밀번호 변경 완료
            </Dialog.Title>
            <p className="text-sm font-bold text-gray-700">
              다시 로그인해주세요.
            </p>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-custom-pink px-4 py-2 font-bold text-white shadow-md transition duration-300 hover:brightness-110"
            >
              확인
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
