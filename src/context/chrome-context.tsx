import { createContext, useContext, type ReactNode } from 'react';

/**
 * Marks a subtree whose top safe-area is already cleared by app chrome (the
 * persistent top nav). Screens beneath it should skip their own top inset to
 * avoid double padding.
 */
const ChromeInsetContext = createContext(false);

export function ChromeInsetProvider({ children }: { children: ReactNode }) {
  return (
    <ChromeInsetContext.Provider value={true}>
      {children}
    </ChromeInsetContext.Provider>
  );
}

export function useTopInsetHandled(): boolean {
  return useContext(ChromeInsetContext);
}
