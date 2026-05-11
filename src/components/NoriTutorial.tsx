"use client";

// Emergency rollback: disable tutorial rendering completely.
// Keep this component file so existing imports do not break.
// After the home screen is restored, replace this with a safer modal-only tutorial implementation.

type NoriTutorialProps = {
  forceOpen?: boolean;
  showLauncher?: boolean;
  storageKey?: string;
  level?: number;
  className?: string;
};

export function NoriTutorial(_props: NoriTutorialProps) {
  return null;
}

export default NoriTutorial;
