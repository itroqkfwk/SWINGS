import React, { Component, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./1_user/components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";

class ChunkErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Failed to fetch dynamically imported module")
    ) {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-bold text-slate-800">최신 화면으로 업데이트 중입니다...</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const UserLayout = lazy(() => import("./1_user/layouts/UserLayout"));
const AdminLayout = lazy(() => import("./1_user/layouts/AdminLayout"));
const UserRoutes = lazy(() => import("./1_user/routes/UserRoutes"));
const AdminRoutes = lazy(() => import("./1_user/routes/AdminRoutes"));
const StartLogin = lazy(() => import("./1_user/pages/StartLogin"));
const SignUp = lazy(() => import("./1_user/pages/SignUp"));
const MatchRoutes = lazy(() => import("./3_match/routes/MatchRoutes"));
const ChatRoutes = lazy(() => import("./3_match/routes/ChatRoutes"));
const FeedRoutes = lazy(() => import("./2_feed/routes/FeedRoutes"));
const MatchGroupRoutes = lazy(
  () => import("./4_matchgroup/routes/MatchGroupRoutes.jsx")
);
const NotificationRoutes = lazy(
  () => import("./5_notification/routes/NotificationRoutes.jsx")
);
const SocialRoutes = lazy(() => import("./2_feed/routes/SocialRoutes"));
const SocialPage = lazy(() => import("./2_feed/pages/SocialPage"));
const MyPage = lazy(() => import("./1_user/pages/MyPage"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--shell-bg)] px-6">
    <div className="glass-panel w-full max-w-md rounded-[2rem] border border-white/70 px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">
        Swings
      </p>
      <h1 className="mt-3 text-xl font-black text-slate-900">
        화면을 준비하는 중입니다
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        필요한 화면만 순서대로 불러오고 있습니다.
      </p>
    </div>
  </div>
);

export default function App() {
  return (
    <ChunkErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/swings" replace />} />

          <Route path="/swings" element={<StartLogin />} />
          <Route path="/swings/signup" element={<SignUp />} />

          <Route path="/swings/admin/*" element={<AdminLayout />}>
            <Route path="*" element={<AdminRoutes />} />
          </Route>

          <Route
            path="/swings/*"
            element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route path="match/*" element={<MatchRoutes />} />
            <Route path="matchgroup/*" element={<MatchGroupRoutes />} />
            <Route path="chat/*" element={<ChatRoutes />} />
            <Route path="feed/*" element={<FeedRoutes />} />
            <Route path="social/*" element={<SocialRoutes />} />
            <Route path="notification/*" element={<NotificationRoutes />} />
            <Route path="profile/:userId" element={<SocialPage />} />
            <Route path="*" element={<UserRoutes />} />
            <Route path="mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
