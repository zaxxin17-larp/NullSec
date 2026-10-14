import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase JS SDK (not React Native Firebase) so everything works in Expo Go.
 * All secrets/config come from EXPO_PUBLIC_* environment variables — never hardcode.
 */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** True when the minimum required Firebase env vars are present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

// When the EXPO_PUBLIC_* vars are missing, `getAuth` throws `auth/invalid-api-key`
// at import time. In release builds that uncaught error kills the process, so the
// app would close the instant it opens. Pass placeholder values instead so the app
// can still boot and show a clear "not configured" state.
const effectiveConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      ...firebaseConfig,
      apiKey: 'unconfigured',
      projectId: 'unconfigured',
      appId: 'unconfigured',
    };

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(effectiveConfig);

function createAuth(): Auth {
  try {
    // Persist the session in AsyncStorage so users stay logged in between launches.
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if invoked twice (e.g. Fast Refresh) — reuse instance.
    return getAuth(app);
  }
}

export const auth: Auth = createAuth();

function createFirestore(): Firestore {
  try {
    // React Native's WebChannel streaming transport can drop the 'Listen' stream
    // and log noisy "transport errored" warnings before silently reconnecting.
    // Auto-detected long-polling falls back to a more reliable transport.
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    // initializeFirestore throws if invoked twice (e.g. Fast Refresh).
    return getFirestore(app);
  }
}

export const db: Firestore = createFirestore();
export { app };
