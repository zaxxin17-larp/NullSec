import { createContext, useContext, type ReactNode } from 'react';

/**
 * Marks a subtree whose *bottom* safe-area is already cleared by app chrome
 * (the persistent bottom navigation). Screens beneath it should skip their own
 * bottom inset to avoid double padding.
 */
const ChromeInsetContext = createContext(false);

export function ChromeInsetProvider({ children }: { children: ReactNode }) {
  return (
    <ChromeInsetContext.Provider value={true}>
      {children}
    </ChromeInsetContext.Provider>
  );
}

export function useBottomInsetHandled(): boolean {
  return useContext(ChromeInsetContext);
}
