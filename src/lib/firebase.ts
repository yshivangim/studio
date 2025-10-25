import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Replace with your own Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL383RPqmLa-slX10bf1ko-VrCM9fBkqQ",
  authDomain: "studio-2446696699-3510f.firebaseapp.com",
  projectId: "studio-2446696699-3510f",
  storageBucket: "studio-2446696699-3510f.appspot.com",
  messagingSenderId: "933954996577",
  appId: "1:933954996577:web:97478cc89775ccaedf5d20",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
