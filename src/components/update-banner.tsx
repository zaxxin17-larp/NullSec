import { HackingLoader } from '@/components/hacking-loader';
import type { UpdatePhase } from '@/updates';

type UpdateBannerProps = {
  visible: boolean;
  message: string;
  phase: UpdatePhase;
};

/**
 * Full-screen code-rain overlay shown while checking for / applying OTA updates.
 */
export function UpdateBanner({ visible, message, phase }: UpdateBannerProps) {
  if (!visible || !message) {
    return null;
  }

  return (
    <HackingLoader
      message={message}
      error={phase === 'error'}
      testID="update-banner-message"
    />
  );
}
