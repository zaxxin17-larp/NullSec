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
    title: 'PATCH // CARET INTEGRITY',
    notes: [
      'Fixed a TextInput glitch that dropped keystrokes after validation errors.',
      'Terminal cursor now occupies a fixed slot — no more input jitter.',
      'Added release notifications and a code-rain boot sequence.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-13',
    title: 'INITIAL BREACH',
    notes: [
      'Email/password auth with persistent sessions.',
      'Firestore profile records with self-only security rules.',
      'Hacker terminal theme + Share Tech Mono.',
    ],
  },
];

export const LATEST_RELEASE: Release = RELEASES[0];

/** Storage key used to remember which release the operator has dismissed. */
export const DISMISSED_RELEASE_KEY = 'nullsec.dismissedRelease';
