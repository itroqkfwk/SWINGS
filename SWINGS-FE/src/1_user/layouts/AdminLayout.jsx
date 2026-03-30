// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminNavBar from "../../components/AdminNavBar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
