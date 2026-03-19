import { useEffect, useMemo, useState } from "react";
import { Search, Shield, UserRound } from "lucide-react";
import { fetchAllUsers } from "../api/userApi";
import UserDetailModal from "../components/UserDetailModal";

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await fetchAllUsers();
    setUsers(data);
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(keyword) ||
        user.name?.toLowerCase().includes(keyword)
    );
  }, [search, users]);

  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              유저 관리
            </h1>
            <p className="text-sm text-slate-500">
              전체 유저를 검색하고 권한 변경이나 상세 관리 작업을 진행합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Total Users
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {users.length}
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
                Admins
              </div>
              <div className="mt-2 text-2xl font-black text-amber-700">
                {adminCount}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 max-w-lg">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="아이디 또는 이름 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">아이디</th>
                <th className="px-6 py-4 font-bold">이름</th>
                <th className="px-6 py-4 font-bold">권한</th>
                <th className="px-6 py-4 font-bold">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.username}
                  className="border-t border-slate-100 text-slate-700"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                        user.role === "admin"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <Shield size={14} />
                      ) : (
                        <UserRound size={14} />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedUser(user.username)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                    >
                      상세 보기
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm text-slate-400"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal
          username={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => {
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </section>
  );
}
