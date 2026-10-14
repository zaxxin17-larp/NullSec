import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '@/firebase';
import { timestampToDate } from '@/utils/firestore';

/**
 * Class-wide group chat at messages/{id}. Any signed-in classmate can read and
 * post; a message may be deleted by its author or an admin.
 */
export type Message = {
  id: string;
  text: string;
  authorUid: string;
  authorName: string;
  createdAt: Date | null;
};

export const MAX_MESSAGE_LENGTH = 2000;
const MESSAGE_PAGE_SIZE = 100;

const messagesCollection = () => collection(db, 'messages');

/**
 * Subscribe to the most recent messages, returned oldest-first for display.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  onData: (messages: Message[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const recentQuery = query(
    messagesCollection(),
    orderBy('createdAt', 'desc'),
    limit(MESSAGE_PAGE_SIZE),
  );

  return onSnapshot(
    recentQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          text: typeof data.text === 'string' ? data.text : '',
          authorUid: typeof data.authorUid === 'string' ? data.authorUid : '',
          authorName:
            typeof data.authorName === 'string' ? data.authorName : 'Unknown',
          createdAt: timestampToDate(data.createdAt),
        } satisfies Message;
      });
      messages.reverse();
      onData(messages);
    },
    (error) => onError?.(error),
  );
}

export async function sendMessage(
  authorUid: string,
  authorName: string,
  text: string,
): Promise<void> {
  await addDoc(messagesCollection(), {
    text: text.trim().slice(0, MAX_MESSAGE_LENGTH),
    authorUid,
    authorName: authorName.trim().slice(0, 120),
    createdAt: serverTimestamp(),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', id));
}
