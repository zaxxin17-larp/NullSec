export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_USERNAME_LENGTH = 3;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'ERROR: IDENTITY REQUIRED';
  if (!EMAIL_REGEX.test(value)) return 'ERROR: MALFORMED IDENTITY';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'ERROR: PASSPHRASE REQUIRED';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `ERROR: PASSPHRASE MIN ${MIN_PASSWORD_LENGTH} CHARS`;
  }
  return null;
}

export function validateUsername(username: string): string | null {
  const value = username.trim();
  if (!value) return 'ERROR: CALLSIGN REQUIRED';
  if (value.length < MIN_USERNAME_LENGTH) {
    return `ERROR: CALLSIGN MIN ${MIN_USERNAME_LENGTH} CHARS`;
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return 'ERROR: CONFIRM PASSPHRASE';
  if (password !== confirmPassword) return 'ERROR: PASSPHRASE MISMATCH';
  return null;
}

export type FieldErrors = Record<string, string | null>;
