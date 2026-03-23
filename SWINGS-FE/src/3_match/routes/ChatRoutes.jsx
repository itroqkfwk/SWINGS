import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const ChatListPage = lazy(() => import("../pages/ChatListPage"));
const ChatRoomPage = lazy(() => import("../pages/ChatRoomPage"));
const LikeListPage = lazy(() => import("../pages/LikeListPage"));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
    채팅 페이지를 불러오는 중입니다...
  </div>
);

const ChatRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="" element={<ChatListPage />} />
      <Route path=":roomId" element={<ChatRoomPage />} />
      <Route path="likes/:userId" element={<LikeListPage />} />
    </Routes>
  </Suspense>
);

export default ChatRoutes;
