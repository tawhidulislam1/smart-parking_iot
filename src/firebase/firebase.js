import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET1,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// 🔹 Request Permission
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      console.log("✅ FCM Token:", token);

      return token;
    } else {
      alert("Notification permission denied!");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

onMessage(messaging, async (payload) => {
  console.log("📩 Foreground message received:", payload);

  if (Notification.permission === "granted") {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icon.png",
      });
    } else {
      console.warn(
        "⚠️ No service worker registration found for notifications."
      );
    }
  }
});
