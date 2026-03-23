import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const SwipePage = lazy(() => import("../pages/SwipePage"));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
    소개팅 페이지를 불러오는 중입니다...
  </div>
);

const MatchRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="" element={<SwipePage />} />
    </Routes>
  </Suspense>
);

export default MatchRoutes;
