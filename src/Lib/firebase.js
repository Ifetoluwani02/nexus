import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAtxlFPzM2sfZ6mjoArVKXHy1LGlRNuwuA",
  authDomain: "nexus-financial-app.firebaseapp.com",
  projectId: "nexus-financial-app",
  storageBucket: "nexus-financial-app.appspot.com", // Fixed typo
  messagingSenderId: "1093795818899",
  appId: "1:1093795818899:web:46c5dbae34c36fd9198c66",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY", // Replace with your actual VAPID Key
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving FCM token:", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
