# >_ NULLSEC

A hacker-themed authentication app built with **React Native + Expo (TypeScript)** and
**Expo Router**. Firebase JS SDK powers auth + Firestore, and `expo-updates` (EAS Update)
delivers over-the-air updates.

- Black canvas `#0a0a0a`, neon green phosphor `#00ff41`, dim green borders
- Share Tech Mono everywhere, terminal-style inputs with a `>` prompt and blinking cursor
- Typewriter `NULLSEC` logo, sharp corners, glowing focus borders, uppercase buttons

## Screens

| Route | Purpose |
| --- | --- |
| `/(auth)/login` | Email + password, validation, typewriter logo, link to sign up |
| `/(auth)/signup` | Username, email, password, confirm, Terms modal + checkbox |
| `/(app)/home` | `ACCESS GRANTED`, username, update check, logout |

Root navigation is gated by a single `onAuthStateChanged` subscription
(`src/context/auth-context.tsx`). Logged-in users land on Home, logged-out users on Login.

## Requirements

- Node.js 20+ and npm
- The **Expo Go** app on your device (or a dev/preview build)
- A Firebase project with **Email/Password** auth enabled

## 1. Install

```bash
npm install
```

## 2. Configure Firebase

1. In the Firebase console create a project and add a **Web** app.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Firestore Database** (production mode).
4. Copy the env template and fill in your keys:

```bash
cp .env.example .env
```

`.env` (never committed):

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

These are read at runtime in `src/firebase.ts`. No keys are hardcoded.

### Firestore security rules

`firestore.rules` allows a user to read/write only their own `users/{uid}` document:

```
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

Publish them with the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## 3. Run

```bash
npx expo start
```

Scan the QR code with **Expo Go**. Press `a` to launch on a connected Android device/emulator.

> Tip (Termux): if you get `/usr/bin/env: bad interpreter` when running CLI tools, run
> `termux-fix-shebang node_modules/.bin/*` or make sure the `termux-exec` package is active.

Useful scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
```

## Project structure

```
src/
  app/                         Expo Router routes
    _layout.tsx                fonts, splash, AuthProvider, Stack
    index.tsx                  auth-state redirect gate
    (auth)/login.tsx
    (auth)/signup.tsx
    (app)/home.tsx
  components/                  TerminalInput, TerminalButton, TypewriterText,
                               BlinkingCursor, TermsModal, UpdateBanner, ScreenContainer
  context/auth-context.tsx     onAuthStateChanged provider + useAuth()
  services/auth.ts             signUp / logIn / logOut / subscribeToAuth
  utils/errors.ts              Firebase code -> "ERROR: ..." messages
  utils/validation.ts          field validators
  firebase.ts                  Firebase app + RN-persistent auth + Firestore
  updates.ts                   expo-updates check/fetch/reload helper
  theme.ts                     colors, fonts, spacing (single source of truth)
assets/                        icon / adaptive / splash (SVG sources + PNG exports)
app.json                       Expo config (splash bg #0a0a0a, ON_LOAD updates)
eas.json                       development / preview / production channels
firestore.rules                security rules
```

## 4. Auto updates (EAS Update)

`app.json` sets `updates.checkAutomatically: "ON_LOAD"` and `fallbackToCacheTimeout: 0`
so launch is never blocked. At runtime `src/updates.ts` uses
`checkForUpdateAsync` → `fetchUpdateAsync` → `reloadAsync`, showing a themed
`UPDATE AVAILABLE - RESTARTING...` banner first.

> `expo-updates` is **disabled in Expo Go**. To exercise OTA updates you need a
> dev/preview/dev-client build. In Home, the **Check for updates** button reports
> `UPDATES DISABLED (DEV MODE)` when running under Expo Go.

One-time setup (interactive — requires an Expo account):

```bash
npm install -g eas-cli
eas login
eas init                 # links the project, writes a projectId + updates.url
eas update:configure     # verifies update channels/URL
```

### Build an installable APK (preview profile)

```bash
eas build --platform android --profile preview
```

The `preview` profile uses `android.buildType: "apk"` + `distribution: "internal"`, so the
build output is a directly installable APK. Download the artifact from the link EAS prints
(or from the Expo dashboard) and sideload it.

### Push an over-the-air update

```bash
eas update --channel preview --message "fix: tighten login validation"
```

The `preview` channel matches the `preview` build profile, so installed preview builds pick
the update up on next launch (`ON_LOAD`).

Profiles (`eas.json`): `development`, `preview`, `production`, each tied to a channel of the
same name.
