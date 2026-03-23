import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoute from "../components/AdminRoute";

const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminUserList = lazy(() => import("../pages/AdminUserList"));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
    관리자 페이지를 불러오는 중입니다...
  </div>
);

export default function AdminRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path=""
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="users"
          element={
            <AdminRoute>
              <AdminUserList />
            </AdminRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
