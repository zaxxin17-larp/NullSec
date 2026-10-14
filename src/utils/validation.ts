export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NAME_LENGTH = 2;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Email is required.';
  if (!EMAIL_REGEX.test(value)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validateUsername(name: string): string | null {
  const value = name.trim();
  if (!value) return 'Name is required.';
  if (value.length < MIN_NAME_LENGTH) {
    return `Name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return 'Confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

export type FieldErrors = Record<string, string | null>;
