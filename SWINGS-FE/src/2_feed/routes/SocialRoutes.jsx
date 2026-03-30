import React from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../1_user/components/PrivateRoute";
import SocialPage from "../pages/SocialPage";

export default function SocialRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <SocialPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
