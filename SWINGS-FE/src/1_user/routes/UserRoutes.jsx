import { Route, Routes } from "react-router-dom";
import FeedPage from "../../2_feed/pages/FeedPage";
import PrivateRoute from "../components/PrivateRoute";
import DeleteUserModal from "../components/DeleteUserModal";
import PasswordChangeForm from "../components/PasswordChangeForm";
import UpdateForm from "../components/UpdateForm";
import MyPage from "../pages/MyPage";
import MyPointPage from "../pages/MyPointPage";
import PointCharge from "../pages/PointCharge";
import ProfileImage from "../pages/ProfileImage";
import TossCheckout from "../pages/TossCheckout";
import TossFail from "../pages/TossFail";
import TossSuccess from "../pages/TossSuccess";

export default function UserRoutes() {
  return (
    <Routes>
      <Route
        path="feed"
        element={
          <PrivateRoute>
            <FeedPage />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage"
        element={
          <PrivateRoute>
            <MyPage />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/profileImage"
        element={
          <PrivateRoute>
            <ProfileImage />
          </PrivateRoute>
        }
      />

      <Route
        path="points"
        element={
          <PrivateRoute>
            <MyPointPage />
          </PrivateRoute>
        }
      />

      <Route
        path="shop"
        element={
          <PrivateRoute>
            <PointCharge />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/points/checkout"
        element={
          <PrivateRoute>
            <TossCheckout />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/points/success"
        element={
          <PrivateRoute>
            <TossSuccess />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/points/fail"
        element={
          <PrivateRoute>
            <TossFail />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/update"
        element={
          <PrivateRoute>
            <UpdateForm />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/passwordchange"
        element={
          <PrivateRoute>
            <PasswordChangeForm />
          </PrivateRoute>
        }
      />

      <Route
        path="mypage/userdelete"
        element={
          <PrivateRoute>
            <DeleteUserModal />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
