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
 */
export type MemberProfile = {
  uid: string;
  username: string;
  createdAt: Date | null;
};

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
      const members = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          uid: document.id,
          username: typeof data.username === 'string' ? data.username : 'Unknown',
          createdAt: timestampToDate(data.createdAt),
        } satisfies MemberProfile;
      });
      onData(members);
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
      createdAt: serverTimestamp(),
    });
  } catch {
    // Rules may not be deployed yet, or offline — the directory entry is optional.
  }
}
