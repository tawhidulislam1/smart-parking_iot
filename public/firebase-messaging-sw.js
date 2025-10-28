
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCnbDgunWuZqrWfJFnYqbmTk0sOPgl_gH8",
  authDomain: "smart-parking-using-iot-86d8f.firebaseapp.com",
  projectId: "smart-parking-using-iot-86d8f",
  messagingSenderId: "156884426495",
  appId: "1:156884426495:web:89f02f99a4f9421857b6ca",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
