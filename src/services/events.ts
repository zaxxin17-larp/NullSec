import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '@/firebase';

/**
 * Calendar events live in a per-user subcollection: users/{uid}/events/{eventId}.
 * Kept under the user's own document so the existing owner-only security model
 * (and rules) extend naturally.
 */
export type CalendarEvent = {
  id: string;
  title: string;
  /** Local date key, `YYYY-MM-DD`. */
  date: string;
  notes: string;
  createdAt: Date | null;
};

export const MAX_TITLE_LENGTH = 120;
export const MAX_NOTES_LENGTH = 1000;

function eventsCollection(uid: string) {
  return collection(db, 'users', uid, 'events');
}

function timestampToDate(value: unknown): Date | null {
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

/**
 * Subscribe to the signed-in user's events (ordered by date). Returns an
 * unsubscribe function. Reports permission/network failures via `onError`.
 */
export function subscribeToEvents(
  uid: string,
  onData: (events: CalendarEvent[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const eventsQuery = query(eventsCollection(uid), orderBy('date', 'asc'));

  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      const events = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          title: typeof data.title === 'string' ? data.title : '',
          date: typeof data.date === 'string' ? data.date : '',
          notes: typeof data.notes === 'string' ? data.notes : '',
          createdAt: timestampToDate(data.createdAt),
        } satisfies CalendarEvent;
      });
      onData(events);
    },
    (error) => onError?.(error),
  );
}

export async function addEvent(
  uid: string,
  input: { title: string; date: string; notes?: string },
): Promise<void> {
  await addDoc(eventsCollection(uid), {
    title: input.title.trim().slice(0, MAX_TITLE_LENGTH),
    date: input.date,
    notes: (input.notes ?? '').trim().slice(0, MAX_NOTES_LENGTH),
    createdAt: serverTimestamp(),
  });
}

export async function deleteEvent(uid: string, eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'events', eventId));
}
