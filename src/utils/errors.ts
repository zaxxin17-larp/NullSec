import { FirebaseError } from 'firebase/app';

/**
 * Maps Firebase auth error codes to short terminal-style messages.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'ERROR: MALFORMED IDENTITY',
  'auth/missing-email': 'ERROR: IDENTITY REQUIRED',
  'auth/email-already-in-use': 'ERROR: IDENTITY EXISTS',
  'auth/weak-password': 'ERROR: WEAK PASSPHRASE',
  'auth/wrong-password': 'ERROR: ACCESS DENIED',
  'auth/invalid-credential': 'ERROR: ACCESS DENIED',
  'auth/user-not-found': 'ERROR: ACCESS DENIED',
  'auth/user-disabled': 'ERROR: IDENTITY REVOKED',
  'auth/missing-password': 'ERROR: PASSPHRASE REQUIRED',
  'auth/too-many-requests': 'ERROR: RATE LIMIT EXCEEDED',
  'auth/network-request-failed': 'ERROR: NETWORK UNREACHABLE',
  'auth/operation-not-allowed': 'ERROR: METHOD DISABLED',
  'auth/requires-recent-login': 'ERROR: REAUTHENTICATION REQUIRED',
  'auth/internal-error': 'ERROR: INTERNAL FAILURE',
};

export function mapAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      AUTH_ERROR_MESSAGES[error.code] ??
      `ERROR: ${error.code.replace(/^auth\//, '').replace(/-/g, ' ').toUpperCase()}`
    );
  }
  if (error instanceof Error && error.message) {
    return `ERROR: ${error.message.toUpperCase()}`;
  }
  return 'ERROR: UNKNOWN FAILURE';
}
