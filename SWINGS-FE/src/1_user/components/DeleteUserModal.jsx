import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUserWithPassword } from "../api/userApi";
import { removeToken } from "../utils/userUtils";

export default function DeleteUserModal({ onClose }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await deleteUserWithPassword(password);
      alert("회원 탈퇴가 완료되었습니다.");
      removeToken();
      navigate("/swings");
    } catch {
      alert("비밀번호가 올바르지 않거나 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 pt-24 pb-28">
      <div className="relative max-h-[calc(100vh-10rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <button
          className="absolute right-4 top-4 text-sm text-gray-500 hover:text-black"
          onClick={onClose}
        >
          닫기
        </button>

        <h2 className="mb-4 text-center text-xl font-bold">비밀번호 확인</h2>

        <input
          type="password"
          className="mb-4 w-full rounded border border-gray-300 p-2 text-sm text-black"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="rounded bg-gray-300 px-4 py-2 text-sm"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="rounded bg-black px-4 py-2 text-sm text-white"
            onClick={handleSubmit}
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}
