
'use client';

import { ReactNode, useMemo } from 'react';
import { getAppInstance, getAuthInstance, getDbInstance } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const app = useMemo(getAppInstance, []);
  const auth = useMemo(getAuthInstance, []);
  const db = useMemo(getDbInstance, []);

  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
