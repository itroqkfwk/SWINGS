import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, House, LogOut, Users } from "lucide-react";
import { removeToken } from "../1_user/utils/userUtils";

const navLinkClassName = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function AdminNavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/swings");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/swings/feed")}
            className="text-xl font-black tracking-tight text-slate-900"
          >
            SWINGS
          </button>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Admin
          </span>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/swings/feed" className={navLinkClassName}>
            <House size={16} />
            홈
          </NavLink>
          <NavLink to="/swings/admin" end className={navLinkClassName}>
            <LayoutDashboard size={16} />
            대시보드
          </NavLink>
          <NavLink to="/swings/admin/users" className={navLinkClassName}>
            <Users size={16} />
            유저 관리
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </header>
  );
}
