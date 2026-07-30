import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Heart, LogOut, Shield, UserRound } from "lucide-react";
import { fetchUserData } from "../1_user/api/userApi";
import { useAuth } from "../1_user/context/AuthContext";
import { useNotification } from "../5_notification/context/NotificationContext";
import NotificationDropdown from "../5_notification/components/NotificationDropdown";

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const isNotificationPage = location.pathname.startsWith("/swings/notification");

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await fetchUserData();
        if (active) {
          setCurrentUser(user);
        }
      } catch {
        if (active) {
          setCurrentUser(null);
        }
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, [token, location.pathname]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("username");
    navigate("/swings", { replace: true });
  };

  return (
    <header className="fixed top-3 z-50 w-full px-3 sm:px-5 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 px-3 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/swings/feed"
            className="shrink-0 rounded-full bg-slate-900 px-3 py-2 text-sm font-black tracking-[0.24em] text-white transition hover:bg-slate-800 sm:text-base"
          >
            SWINGS
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate("/swings/points")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-[0_10px_30px_rgba(244,114,182,0.28)] transition hover:scale-[1.03]"
            aria-label="포인트"
          >
            <Heart className="h-5 w-5 fill-current" />
          </button>

          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button
              type="button"
              onClick={() => navigate("/swings/notification")}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="알림"
            >
              <Bell size={19} />
              {!isNotificationPage && unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && <NotificationDropdown />}
          </div>

          {currentUser && (
            <>
              <button
                type="button"
                onClick={() => navigate("/swings/mypage")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 md:hidden"
                aria-label="마이페이지"
              >
                <UserRound size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/swings/mypage")}
                className="hidden items-center gap-2 rounded-full border border-white/70 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
              >
                <UserRound size={16} />
                <span className="max-w-28 truncate">{currentUser.username}</span>
              </button>

              {currentUser.role === "admin" && (
                <button
                  type="button"
                  onClick={() => navigate("/swings/admin")}
                  className="hidden items-center gap-1 rounded-full bg-amber-100 px-2.5 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-200 md:inline-flex"
                >
                  <Shield size={13} />
                  <span>관리자</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/70 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            aria-label="로그아웃"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
