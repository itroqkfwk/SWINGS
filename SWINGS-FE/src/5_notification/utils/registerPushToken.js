import { getToken } from "firebase/messaging";
import axiosInstance from "../../1_user/api/axiosInstance.js";
import { isFirebaseConfigured, messagingPromise } from "../../utils/firebase.js";

export const registerPushToken = async (username) => {
  console.log("registerPushToken called for user:", username);

  if (!isFirebaseConfigured) {
    console.warn("Firebase config is incomplete. Skipping push token registration.");
    return;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Firebase VAPID key is missing. Skipping push token registration.");
    return;
  }

  try {
    const messaging = await messagingPromise;
    if (!messaging) {
      console.warn("Firebase messaging is unavailable. Skipping push token registration.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("Push token was not issued.");
      return;
    }

    await axiosInstance.post(
      `/fcm/register-token?username=${username}`,
      token,
      { headers: { "Content-Type": "text/plain" } }
    );
  } catch (error) {
    console.error("Push token registration failed:", error);
  }
};
