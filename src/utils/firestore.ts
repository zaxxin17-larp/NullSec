/** Convert a Firestore Timestamp-like value into a Date, or null. */
export function timestampToDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}
