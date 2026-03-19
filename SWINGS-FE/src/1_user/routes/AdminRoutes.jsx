import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/AdminRoute";
import AdminDashboard from "../pages/AdminDashboard";
import AdminUserList from "../pages/AdminUserList";

export default function AdminRoutes() {
  return (
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
  );
}
