'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
  user: null,
});

export const useFirebaseApp = () => useContext(FirebaseContext)?.app;
export const useAuth = () => useContext(FirebaseContext)?.auth;
export const useFirestore = () => useContext(FirebaseContext)?.db;
export const useUser = () => {
    const context = useContext(FirebaseContext);
    return context?.user;
}

interface FirebaseProviderProps {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

export function FirebaseProvider({ children, app, auth, db }: FirebaseProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);
  
  const value = { app, auth, db, user };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}
