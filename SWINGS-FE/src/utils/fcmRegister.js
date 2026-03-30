import { getToken } from "firebase/messaging";
import { API_BASE_URL } from "../config/runtime";
import { isFirebaseConfigured, messagingPromise } from "./firebase";

export const registerFCM = async (username) => {
  console.log("registerFCM called for user:", username);

  if (!isFirebaseConfigured) {
    console.warn("Firebase config is incomplete. Skipping FCM registration.");
    return;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("This browser does not support service workers.");
    return;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Firebase VAPID key is missing. Skipping FCM registration.");
    return;
  }

  try {
    const messaging = await messagingPromise;
    if (!messaging) {
      console.warn("Firebase messaging is unavailable. Skipping FCM registration.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was not granted.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("FCM token was not issued.");
      return;
    }

    await fetch(`${API_BASE_URL}/fcm/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, username }),
    });
  } catch (error) {
    console.error("FCM registration failed:", error);
  }
};
