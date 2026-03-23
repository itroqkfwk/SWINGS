import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const MatchGroupList = lazy(() => import("../pages/MatchGroupList.jsx"));
const MatchGroupCreate = lazy(() => import("../pages/MatchGroupCreate.jsx"));
const MatchGroupDetail = lazy(() => import("../pages/MatchGroupDetail.jsx"));
const MatchGroupMain = lazy(() => import("../pages/MatchGroupMain.jsx"));
const MatchGroup = lazy(() => import("../pages/MatchGroup.jsx"));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
    모임 페이지를 불러오는 중입니다...
  </div>
);

const MatchGroupRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route index element={<MatchGroupMain />} />
        <Route path="create" element={<MatchGroupCreate />} />
        <Route path=":category" element={<MatchGroupList />} />
        <Route path=":category/:matchGroupId" element={<MatchGroupDetail />} />
        <Route path="waitingroom/:matchGroupId" element={<MatchGroup />} />
      </Routes>
    </Suspense>
  );
};

export default MatchGroupRoutes;
