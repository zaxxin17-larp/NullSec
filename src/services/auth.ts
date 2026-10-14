import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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
