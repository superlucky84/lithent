import type { CompKey } from 'lithent';
import { setComponentMapManualMode, disposeComponentEntry } from 'lithent';

let manualModeRefCount = 0;

export const enableComponentMapManualMode = (): void => {
  manualModeRefCount += 1;
  setComponentMapManualMode(true);
};

export const disableComponentMapManualMode = (): void => {
  manualModeRefCount = Math.max(0, manualModeRefCount - 1);
  if (manualModeRefCount === 0) {
    setComponentMapManualMode(false);
  }
};

export const removeComponentEntry = (compKey: CompKey): void => {
  disposeComponentEntry(compKey);
};
