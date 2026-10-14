import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/firebase';
import { timestampToDate } from '@/utils/firestore';

/**
 * Public class directory. One document per user at members/{uid} containing only
 * non-sensitive fields (no email), readable by any signed-in classmate.
 *
 * `role` is `admin` or `student`. It is forced to `student` on create and can
 * only be changed out-of-band (Firebase console / admin SDK) — clients cannot
 * promote themselves.
 */
export type MemberRole = 'admin' | 'student';

export type MemberProfile = {
  uid: string;
  username: string;
  role: MemberRole;
  createdAt: Date | null;
};

function toMember(id: string, data: Record<string, unknown>): MemberProfile {
  return {
    uid: id,
    username: typeof data.username === 'string' ? data.username : 'Unknown',
    role: data.role === 'admin' ? 'admin' : 'student',
    createdAt: timestampToDate(data.createdAt),
  };
}

const membersCollection = () => collection(db, 'members');

/** Subscribe to every class member, ordered by name. */
export function subscribeToMembers(
  onData: (members: MemberProfile[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const membersQuery = query(membersCollection(), orderBy('username', 'asc'));

  return onSnapshot(
    membersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((document) => toMember(document.id, document.data())));
    },
    (error) => onError?.(error),
  );
}

/** Subscribe to the signed-in user's own directory entry (for their role). */
export function subscribeToMember(
  uid: string,
  onData: (member: MemberProfile | null) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, 'members', uid),
    (snapshot) => {
      onData(snapshot.exists() ? toMember(uid, snapshot.data()) : null);
    },
    (error) => onError?.(error),
  );
}

/**
 * Create the caller's directory entry if it does not exist yet. Safe to call on
 * every launch; it only writes when the document is missing. Fails silently when
 * the rules have not been deployed so the app keeps working.
 */
export async function ensureMemberProfile(
  uid: string,
  username: string,
): Promise<void> {
  try {
    const ref = doc(db, 'members', uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) return;
    await setDoc(ref, {
      uid,
      username,
      role: 'student',
      createdAt: serverTimestamp(),
    });
  } catch {
    // Rules may not be deployed yet, or offline — the directory entry is optional.
  }
}
