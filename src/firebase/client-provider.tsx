
'use client';

import { ReactNode } from 'react';
import { app, auth, db } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {

  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
