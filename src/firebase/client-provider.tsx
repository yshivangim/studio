'use client';

import { ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDL383RPqmLa-slX10bf1ko-VrCM9fBkqQ",
  authDomain: "studio-2446696699-3510f.firebaseapp.com",
  projectId: "studio-2446696699-3510f",
  storageBucket: "studio-2446696699-3510f.appspot.com",
  messagingSenderId: "933954996577",
  appId: "1:933954996577:web:97478cc89775ccaedf5d20",
};

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

function getFirebaseInstances(): FirebaseInstances {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, db } = useMemo(getFirebaseInstances, []);

  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
