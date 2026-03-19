import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./1_user/context/AuthContext.jsx";
import { NotificationProvider } from "./5_notification/context/NotificationProvider.jsx";
import { registerFCM } from "./utils/fcmRegister.js";

document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    document.body.classList.add("pwa-scroll-hidden");
  }
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

if (!clientId) {
  console.warn("Google OAuth client ID is missing. Google login is disabled.");
}

const username = localStorage.getItem("username");
if (username) {
  registerFCM(username);
}

function AppProviders() {
  const content = (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  if (!clientId) {
    return content;
  }

  return <GoogleOAuthProvider clientId={clientId}>{content}</GoogleOAuthProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
);
