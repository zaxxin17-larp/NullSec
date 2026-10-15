import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  subscribeToAnnouncements,
  type Announcement,
} from '@/services/announcements';
import { subscribeToMessages, type Message } from '@/services/messages';

/** A single entry in the derived activity feed. */
export type ActivityKind = 'announcement' | 'message';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  /** Announcement title, or the author name for a message. */
  title: string;
  /** Announcement body, or the message text. */
  body: string;
  authorName: string;
  createdAt: Date | null;
};

type ActivityContextValue = {
  items: ActivityItem[];
  /** Ids of items created after the last-seen marker. */
  unreadIds: string[];
  /** Count of items created after the last-seen marker. */
  unreadCount: number;
  /** Last-seen timestamp used for the unread count, or null while loading. */
  lastSeen: number | null;
  /** True until both feeds have emitted at least once. */
  loading: boolean;
  /** Record "now" as last-seen so the badge clears. */
  markSeen: () => void;
};

const LAST_SEEN_KEY = 'nullsec:notifications:lastSeen';

const ActivityContext = createContext<ActivityContextValue>({
  items: [],
  unreadIds: [],
  unreadCount: 0,
  lastSeen: null,
  loading: true,
  markSeen: () => {},
});

/**
 * Derives a read-only activity feed from existing data (announcements +
 * messages) and tracks a local "last seen" marker for the unread badge. No
 * extra Firestore writes or rules are required.
 */
export function ActivityProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [readyCount, setReadyCount] = useState(0);
  const [lastSeen, setLastSeen] = useState<number | null>(null);

  useEffect(() => {
    const bumpReady = () => setReadyCount((count) => count + 1);
    const unsubscribeAnnouncements = subscribeToAnnouncements(
      setAnnouncements,
      bumpReady,
    );
    const unsubscribeMessages = subscribeToMessages(setMessages, bumpReady);
    return () => {
      unsubscribeAnnouncements();
      unsubscribeMessages();
    };
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LAST_SEEN_KEY)
      .then((value) => {
        if (!active) return;
        const parsed = value ? Number(value) : NaN;
        // First-ever visit: treat "now" as the baseline so nothing is unread.
        const baseline = Number.isFinite(parsed) ? parsed : Date.now();
        setLastSeen(baseline);
        if (!Number.isFinite(parsed)) {
          AsyncStorage.setItem(LAST_SEEN_KEY, String(baseline)).catch(() => {});
        }
      })
      .catch(() => {
        if (active) setLastSeen(Date.now());
      });
    return () => {
      active = false;
    };
  }, []);

  const markSeen = useCallback(() => {
    const now = Date.now();
    setLastSeen(now);
    AsyncStorage.setItem(LAST_SEEN_KEY, String(now)).catch(() => {});
  }, []);

  const items = useMemo<ActivityItem[]>(() => {
    const merged: ActivityItem[] = [
      ...announcements.map((announcement) => ({
        id: `announcement-${announcement.id}`,
        kind: 'announcement' as const,
        title: announcement.title,
        body: announcement.body,
        authorName: announcement.authorName,
        createdAt: announcement.createdAt,
      })),
      ...messages.map((message) => ({
        id: `message-${message.id}`,
        kind: 'message' as const,
        title: message.authorName,
        body: message.text,
        authorName: message.authorName,
        createdAt: message.createdAt,
      })),
    ];
    merged.sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    return merged;
  }, [announcements, messages]);

  const unreadIds = useMemo(() => {
    if (lastSeen === null) return [];
    return items
      .filter(
        (item) =>
          item.createdAt !== null && item.createdAt.getTime() > lastSeen,
      )
      .map((item) => item.id);
  }, [items, lastSeen]);

  const value = useMemo<ActivityContextValue>(
    () => ({
      items,
      unreadIds,
      unreadCount: unreadIds.length,
      lastSeen,
      loading: readyCount < 2,
      markSeen,
    }),
    [items, unreadIds, lastSeen, readyCount, markSeen],
  );

  return (
    <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
  );
}

export function useActivity(): ActivityContextValue {
  return useContext(ActivityContext);
}
