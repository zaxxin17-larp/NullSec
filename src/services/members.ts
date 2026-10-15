import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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
 *
 * Custom profile fields (all optional strings, empty = unset):
 *   `avatarUrl` — link to a profile picture (https only)
 *   `accent`    — avatar accent colour, `#rrggbb`
 *   `bio`       — short status line
 */
export type MemberRole = 'admin' | 'student';

export type MemberProfile = {
  uid: string;
  username: string;
  role: MemberRole;
  createdAt: Date | null;
  avatarUrl: string;
  accent: string;
  bio: string;
};

/** The editable part of a member's custom profile. */
export type ProfileDetails = {
  avatarUrl: string;
  accent: string;
  bio: string;
};

export const EMPTY_PROFILE: ProfileDetails = { avatarUrl: '', accent: '', bio: '' };

export const BIO_MAX_LENGTH = 120;
export const AVATAR_URL_MAX_LENGTH = 500;

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toMember(id: string, data: Record<string, unknown>): MemberProfile {
  return {
    uid: id,
    username: typeof data.username === 'string' ? data.username : 'Unknown',
    role: data.role === 'admin' ? 'admin' : 'student',
    createdAt: timestampToDate(data.createdAt),
    avatarUrl: asString(data.avatarUrl),
    accent: asString(data.accent),
    bio: asString(data.bio),
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
 * Save the caller's custom profile (avatar link, accent colour, bio). Writes the
 * whole editable set at once so the rules always see the fields it validates.
 */
export async function updateProfileDetails(
  uid: string,
  details: ProfileDetails,
): Promise<void> {
  await updateDoc(doc(db, 'members', uid), {
    uid,
    avatarUrl: details.avatarUrl.trim(),
    accent: details.accent.trim(),
    bio: details.bio.trim(),
  });
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
      avatarUrl: '',
      accent: '',
      bio: '',
    });
  } catch {
    // Rules may not be deployed yet, or offline — the directory entry is optional.
  }
}
