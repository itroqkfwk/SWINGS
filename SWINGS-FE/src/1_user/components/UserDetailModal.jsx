import { useEffect, useState } from "react";
import {
  getUserByUsername,
  updateUserRole,
  deleteUserByAdmin,
} from "../api/userApi";

export default function UserDetailModal({ username, onClose, onUpdated }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserByUsername(username);
        setUser(data);
        setRole(data.role);
      } catch (error) {
        console.error("유저 상세 정보를 불러오지 못했습니다.", error);
      }
    })();
  }, [username]);

  if (!user) {
    return null;
  }

  const handleRoleUpdate = async () => {
    try {
      await updateUserRole(username, role);
      alert("권한이 성공적으로 변경되었습니다.");
      onUpdated();
    } catch {
      alert("권한 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 유저를 탈퇴 처리하시겠습니까?")) {
      return;
    }

    try {
      await deleteUserByAdmin(username);
      alert("유저 탈퇴 처리가 완료되었습니다.");
      onUpdated();
    } catch {
      alert("유저 탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          닫기
        </button>

        <h2 className="mb-4 text-xl font-bold text-slate-900">유저 상세정보</h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>아이디:</strong> {user.username}
          </p>
          <p>
            <strong>이름:</strong> {user.name}
          </p>
          <p>
            <strong>성별:</strong> {user.gender}
          </p>
          <p>
            <strong>직업:</strong> {user.job}
          </p>
          <p>
            <strong>골프 실력:</strong> {user.golfSkill}
          </p>
          <p>
            <strong>권한:</strong> {user.role}
          </p>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            권한 변경
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded border p-2 text-black"
          >
            <option value="player">player</option>
            <option value="admin">admin</option>
          </select>
          <button
            onClick={handleRoleUpdate}
            className="mt-2 rounded bg-green-500 px-4 py-1 text-white"
          >
            권한 변경
          </button>
        </div>

        <hr className="my-6" />

        <button
          onClick={handleDelete}
          className="w-full rounded bg-red-500 py-2 text-white"
        >
          강제 탈퇴
        </button>
      </div>
    </div>
  );
}
