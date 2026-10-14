export type Release = {
  version: string;
  date: string;
  title: string;
  notes: string[];
};

/**
 * Local release feed. Update this list (or swap it for a remote fetch) whenever
 * you ship a new version so the in-app release notification stays current.
 * Newest first.
 */
export const RELEASES: Release[] = [
  {
    version: '1.0.1',
    date: '2026-10-14',
    title: 'Refreshed interface',
    notes: [
      'New clean, light design across every screen.',
      'Rebuilt sign-in, sign-up and home.',
      'Attendance calendar with event planning.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-13',
    title: 'Welcome to NullSec',
    notes: [
      'Email and password accounts with persistent sessions.',
      'Private profile records protected by security rules.',
      'Attendance calendar foundation.',
    ],
  },
];

export const LATEST_RELEASE: Release = RELEASES[0];

/** Storage key used to remember which release the operator has dismissed. */
export const DISMISSED_RELEASE_KEY = 'nullsec.dismissedRelease';
