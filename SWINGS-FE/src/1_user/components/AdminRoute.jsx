import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/userUtils";

export default function AdminRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/swings" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "admin") {
      return <Navigate to="/swings/feed" replace />;
    }
  } catch {
    return <Navigate to="/swings" replace />;
  }

  return children;
}
