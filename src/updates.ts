import * as Updates from 'expo-updates';

export type UpdatePhase =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'restarting'
  | 'up-to-date'
  | 'disabled'
  | 'error';

export type UpdateCheckResult = {
  phase: UpdatePhase;
  message: string;
};

/**
 * Human-readable NullSec-styled status for each phase.
 */
export const UPDATE_MESSAGES: Record<UpdatePhase, string> = {
  idle: '',
  checking: 'SCANNING FOR UPDATES...',
  downloading: 'DOWNLOADING PATCH...',
  restarting: 'UPDATE AVAILABLE - RESTARTING...',
  'up-to-date': 'SYSTEM UP TO DATE',
  disabled: 'UPDATES DISABLED (DEV MODE)',
  error: 'ERROR: UPDATE CHANNEL UNREACHABLE',
};

/**
 * Check for an OTA update, download it, and reload into the new bundle.
 * `onPhase` is invoked as the process progresses so the UI can react.
 *
 * Note: expo-updates is a no-op in Expo Go / plain dev clients — `isEnabled`
 * is false there and we simply report "disabled".
 */
export async function checkForUpdates(
  onPhase: (result: UpdateCheckResult) => void,
): Promise<UpdateCheckResult> {
  const report = (phase: UpdatePhase): UpdateCheckResult => {
    const result = { phase, message: UPDATE_MESSAGES[phase] };
    onPhase(result);
    return result;
  };

  if (!Updates.isEnabled) {
    return report('disabled');
  }

  try {
    report('checking');
    const check = await Updates.checkForUpdateAsync();

    if (!check.isAvailable) {
      return report('up-to-date');
    }

    report('downloading');
    const fetchResult = await Updates.fetchUpdateAsync();

    if (fetchResult.isNew) {
      report('restarting');
      // Give the themed "restarting" message a moment to render before reload.
      await new Promise((resolve) => setTimeout(resolve, 900));
      await Updates.reloadAsync();
      return report('restarting');
    }

    return report('up-to-date');
  } catch {
    return report('error');
  }
}
