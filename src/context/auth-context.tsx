import type { User } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isFirebaseConfigured } from '@/firebase';
import { subscribeToAuth } from '@/services/auth';

type AuthContextValue = {
  /** Signed-in user, or null when logged out. */
  user: User | null;
  /** True until the first onAuthStateChanged callback fires. */
  initializing: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // When Firebase isn't configured there is no session to wait for.
  const [initializing, setInitializing] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Nothing to subscribe to; the "not configured" UI handles this case.
      return;
    }

    // Single onAuthStateChanged subscription drives the whole app's routing.
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
