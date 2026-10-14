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
import { timestampToDate } from '@/utils/firestore';

/**
 * Class-wide announcements at announcements/{id}. Any signed-in classmate can
 * read the feed; only an admin may create or delete posts (enforced by rules).
 */
export type Announcement = {
  id: string;
  title: string;
  body: string;
  authorUid: string;
  authorName: string;
  createdAt: Date | null;
};

export const MAX_ANNOUNCEMENT_TITLE = 120;
export const MAX_ANNOUNCEMENT_BODY = 2000;

const announcementsCollection = () => collection(db, 'announcements');

/** Subscribe to the feed, newest first. Returns an unsubscribe function. */
export function subscribeToAnnouncements(
  onData: (announcements: Announcement[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const feedQuery = query(announcementsCollection(), orderBy('createdAt', 'desc'));

  return onSnapshot(
    feedQuery,
    (snapshot) => {
      const announcements = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          title: typeof data.title === 'string' ? data.title : '',
          body: typeof data.body === 'string' ? data.body : '',
          authorUid: typeof data.authorUid === 'string' ? data.authorUid : '',
          authorName:
            typeof data.authorName === 'string' ? data.authorName : 'Unknown',
          createdAt: timestampToDate(data.createdAt),
        } satisfies Announcement;
      });
      onData(announcements);
    },
    (error) => onError?.(error),
  );
}

export async function addAnnouncement(
  authorUid: string,
  authorName: string,
  input: { title: string; body: string },
): Promise<void> {
  await addDoc(announcementsCollection(), {
    title: input.title.trim().slice(0, MAX_ANNOUNCEMENT_TITLE),
    body: input.body.trim().slice(0, MAX_ANNOUNCEMENT_BODY),
    authorUid,
    authorName: authorName.trim().slice(0, 120),
    createdAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, 'announcements', id));
}
