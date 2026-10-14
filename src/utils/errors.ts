import { FirebaseError } from 'firebase/app';

/** Maps Firebase auth error codes to short, friendly messages. */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-email': 'Email is required.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Choose a stronger password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/missing-password': 'Password is required.',
  'auth/too-many-requests': 'Too many attempts. Try again in a moment.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/operation-not-allowed': 'This sign-in method is disabled.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'auth/internal-error': 'Something went wrong. Please try again.',
};

export function mapAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      AUTH_ERROR_MESSAGES[error.code] ??
      'Something went wrong. Please try again.'
    );
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
