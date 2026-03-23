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

function shouldUsePlainShell(pathname) {
  const plainPatterns = [
    /^\/swings\/feed(?:\/|$)/,
    /^\/swings\/match(?:\/|$)/,
  ];

  return plainPatterns.some((pattern) => pattern.test(pathname));
}

export default function UserLayout() {
  const { pathname } = useLocation();
  const hideBars = shouldHideBars(pathname);
  const usePlainShell = shouldUsePlainShell(pathname);

  return (
    <div
      className={`relative min-h-screen text-slate-900 ${
        usePlainShell ? "bg-slate-50" : "bg-[var(--shell-bg)]"
      }`}
    >
      {!hideBars && !usePlainShell && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.35),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="shell-orb left-[-6rem] top-[-4rem] h-48 w-48 bg-rose-200/60 blur-3xl sm:h-64 sm:w-64" />
          <div className="shell-orb right-[-4rem] top-32 h-44 w-44 bg-sky-200/50 blur-3xl sm:h-56 sm:w-56" />
          <div className="shell-orb bottom-10 left-[12%] h-36 w-36 bg-amber-100/50 blur-3xl sm:h-52 sm:w-52" />
        </>
      )}

      {!hideBars && <TopNavBar />}

      <main
        className={`relative z-10 ${
          !hideBars
            ? usePlainShell
              ? "w-full pb-24 pt-20"
              : "mx-auto w-full max-w-[1480px] px-3 pb-24 pt-20 sm:px-5 lg:px-8"
            : ""
        }`}
      >
        <Outlet />
      </main>

      {!hideBars && <BottomNavBar />}
    </div>
  );
}
