import { Outlet, useLocation } from "react-router-dom";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";

function shouldHideBars(pathname) {
  const hiddenPatterns = [
    /^\/swings\/chat\/[^/]+$/,
    /^\/swings\/matchgroup\/waitingroom\/[^/]+$/,
  ];

  return hiddenPatterns.some((pattern) => pattern.test(pathname));
}

export default function UserLayout() {
  const { pathname } = useLocation();
  const hideBars = shouldHideBars(pathname);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {!hideBars && <TopNavBar />}

      <main className={`${!hideBars ? "pt-16 pb-16" : ""}`}>
        <Outlet />
      </main>

      {!hideBars && <BottomNavBar />}
    </div>
  );
}
