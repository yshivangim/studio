
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDL383RPqmLa-slX10bf1ko-VrCM9fBkqQ",
  authDomain: "studio-2446696699-3510f.firebaseapp.com",
  projectId: "studio-2446696699-3510f",
  storageBucket: "studio-2446696699-3510f.appspot.com",
  messagingSenderId: "933954996577",
  appId: "1:933954996577:web:97478cc89775ccaedf5d20",
  measurementId: ""
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db: Firestore = getFirestore(app);
const storage = getStorage(app);

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

export { app, auth, provider, db, storage, messaging };
