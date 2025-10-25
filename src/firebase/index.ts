'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";


// IMPORTANT: Replace this with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db: Firestore = getFirestore(app);
export const storage = getStorage(app);

// Check if messaging is supported before initializing
let messaging;
if (typeof window !== 'undefined') {
    try {
        messaging = getMessaging(app);
    } catch (e) {
        console.error("Firebase Messaging is not supported in this browser:", e);
        messaging = null;
    }
}

export { app, messaging };
