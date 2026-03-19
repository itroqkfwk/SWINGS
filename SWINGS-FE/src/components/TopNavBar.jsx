import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Heart,
  LogOut,
  Shield,
  UserRound,
} from "lucide-react";
import { fetchUserData } from "../1_user/api/userApi";
import { removeToken } from "../1_user/utils/userUtils";
import { useAuth } from "../1_user/context/AuthContext";
import { useNotification } from "../5_notification/context/NotificationContext";
import NotificationDropdown from "../5_notification/components/NotificationDropdown";

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
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
    removeToken();
    navigate("/swings");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/swings/feed"
            className="shrink-0 text-xl font-black tracking-tight text-slate-900 transition hover:opacity-80"
          >
            SWINGS
          </Link>

          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={() => navigate("/swings/admin")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-200 sm:px-3 sm:text-xs"
            >
              <Shield size={13} />
              <span className="hidden sm:inline">관리자 페이지</span>
              <span className="sm:hidden">관리자</span>
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate("/swings/points")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-500 transition hover:bg-pink-200"
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
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="알림"
            >
              <Bell size={19} />
              {!isNotificationPage && unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </button>

            {showDropdown && <NotificationDropdown />}
          </div>

          {currentUser && (
            <>
              <button
                type="button"
                onClick={() => navigate("/swings/mypage")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 md:hidden"
                aria-label="마이페이지"
              >
                <UserRound size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/swings/mypage")}
                className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
              >
                <UserRound size={16} />
                <span className="max-w-28 truncate">{currentUser.username}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
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
