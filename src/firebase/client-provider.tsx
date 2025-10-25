'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, db } = initializeFirebase();

  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
