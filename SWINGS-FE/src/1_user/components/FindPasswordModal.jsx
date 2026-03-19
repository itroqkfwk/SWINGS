import { useState } from "react";
import { resetPassword } from "../api/userApi";
import { X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FindPasswordModal({ onClose }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await resetPassword({ username, email });
      setMessage(response.data);
      setShowResultModal(true);
    } catch (error) {
      setMessage(error.response?.data || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowResultModal(false);
    onClose();
    navigate("/swings");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>

          <h2 className="mb-2 text-2xl font-bold text-gray-800">비밀번호 찾기</h2>
          <p className="mb-4 text-sm leading-tight text-gray-500">
            아이디와 이메일을 입력하면
            <br />
            임시 비밀번호를 메일로 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="아이디 입력"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full rounded border border-gray-300 px-4 py-2 text-black"
            />

            <input
              type="email"
              placeholder="이메일 입력"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded border border-gray-300 px-4 py-2 text-black"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded py-2 font-semibold text-white transition ${
                username && email
                  ? "bg-custom-purple hover:bg-pink-400"
                  : "bg-custom-purple-empty"
              }`}
            >
              {loading ? "전송 중..." : "임시 비밀번호 보내기"}
            </button>
          </form>

          {message && !showResultModal && (
            <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
              {message}
            </div>
          )}
        </div>
      </div>

      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm animate-fadeIn rounded-2xl bg-white p-8 text-center shadow-2xl">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
            <h3 className="mb-1 text-xl font-semibold text-gray-800">
              임시 비밀번호 전송 완료
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-gray-600">
              입력하신 이메일로
              <br />
              임시 비밀번호를 전송했습니다.
            </p>
            <button
              onClick={handleConfirm}
              className="w-full rounded-lg bg-custom-purple py-2 font-semibold text-white transition hover:bg-pink-400"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
