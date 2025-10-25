
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// This file is the single point of entry for all Firebase services.
// It ensures that Firebase is initialized only once (singleton pattern).

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let provider: GoogleAuthProvider;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
  }
}

// We don't call initializeFirebase() here anymore.
// It will be called by the getter functions to ensure it only runs on the client.

// Export getter functions to ensure single instances
export const getAppInstance = () => {
    if (!app) initializeFirebase();
    return app;
}

export const getAuthInstance = () => {
    if (!auth) initializeFirebase();
    return auth;
}

export const getDbInstance = () => {
    if (!db) initializeFirebase();
    return db;
}

export const getStorageInstance = () => {
    if (!storage) initializeFirebase();
    return storage;
}

export const getGoogleProvider = () => {
    if (!provider) initializeFirebase();
    return provider;
}
