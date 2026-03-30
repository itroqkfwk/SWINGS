import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = ["apiKey", "projectId", "messagingSenderId", "appId"];

export const isFirebaseConfigured = requiredKeys.every((key) => {
  const value = firebaseConfig[key];
  return typeof value === "string" && value.trim().length > 0;
});

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

if (isFirebaseConfigured) {
  console.log("Firebase app initialized");
} else {
  console.warn("Firebase config is incomplete. Messaging is disabled.");
}

let messagingPromise = Promise.resolve(null);

if (app) {
  messagingPromise = isSupported()
    .then((supported) => {
      if (!supported) {
        console.warn("Firebase messaging is not supported in this browser.");
        return null;
      }

      return getMessaging(app);
    })
    .catch((error) => {
      console.error("Failed to initialize Firebase messaging:", error);
      return null;
    });
}

export { app, messagingPromise };
