/**
 * The React Native auth bundle that Metro resolves for `firebase/auth` exports
 * `getReactNativePersistence`, but the type declarations shipped at `firebase/auth`
 * describe only the browser bundle. Augment the module so TypeScript knows about it.
 */
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
