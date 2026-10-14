import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/firebase';

/**
 * Shared class attendance. One document per day at classes/main/days/{date}
 * holding a `marks` map of uid -> status so every classmate can see the roster.
 */
export type AttendanceStatus = 'present' | 'absent' | 'excused';

export type DayMarks = Record<string, AttendanceStatus>;

export type AttendanceDay = {
  date: string;
  marks: DayMarks;
};

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'present',
  'absent',
  'excused',
];

const CLASS_ID = 'main';

const daysCollection = () => collection(db, 'classes', CLASS_ID, 'days');

function normalizeMarks(value: unknown): DayMarks {
  if (!value || typeof value !== 'object') return {};
  const marks: DayMarks = {};
  for (const [uid, status] of Object.entries(value as Record<string, unknown>)) {
    if (status === 'present' || status === 'absent' || status === 'excused') {
      marks[uid] = status;
    }
  }
  return marks;
}

/** Subscribe to attendance for every day in the inclusive [start, end] range. */
export function subscribeToAttendanceRange(
  start: string,
  end: string,
  onData: (days: AttendanceDay[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const daysQuery = query(
    daysCollection(),
    where('date', '>=', start),
    where('date', '<=', end),
    orderBy('date', 'asc'),
  );

  return onSnapshot(
    daysQuery,
    (snapshot) => {
      const days = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          date: typeof data.date === 'string' ? data.date : document.id,
          marks: normalizeMarks(data.marks),
        } satisfies AttendanceDay;
      });
      onData(days);
    },
    (error) => onError?.(error),
  );
}

/** Set the signed-in user's attendance status for a given day (creates the day). */
export async function setMyAttendance(
  uid: string,
  date: string,
  status: AttendanceStatus,
): Promise<void> {
  await setDoc(
    doc(db, 'classes', CLASS_ID, 'days', date),
    {
      date,
      marks: { [uid]: status },
      updatedBy: uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
