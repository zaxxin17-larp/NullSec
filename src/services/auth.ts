import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Unsubscribe,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '@/firebase';

export type AuthUser = User;

/**
 * Create a new account, set the display name, and persist the profile document.
 * Firestore doc lives at users/{uid}.
 */
export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName: username });

  await setDoc(doc(db, 'users', user.uid), {
    username,
    email,
    acceptedTerms: true,
    acceptedTermsAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  // Best-effort public directory entry (name only). Ignored if rules are not yet
  // deployed so sign-up never fails because of it.
  try {
    await setDoc(doc(db, 'members', user.uid), {
      uid: user.uid,
      username,
      role: 'student',
      createdAt: serverTimestamp(),
    });
  } catch {
    // Directory entry will be created lazily on next launch.
  }

  return user;
}

/** Email + password sign in. */
export async function logIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Sign the current user out. */
export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Send a password-reset email. Firebase does not reveal whether the account exists. */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/** Subscribe to auth state changes. Returns the unsubscribe function. */
export function subscribeToAuth(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/** Current signed-in user (synchronously, may be null before first callback). */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
