import type { InjectionKey } from 'vue';
import { inject } from 'vue';

export type RpKeyboardApi = {
  bindInput: (get: () => string, onCommit: (value: string) => void) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  resetBinding: () => void;
};

export const RP_KEYBOARD_KEY: InjectionKey<RpKeyboardApi> = Symbol('rp-keyboard');

export function useRpKeyboard(): RpKeyboardApi {
  const ctx = inject(RP_KEYBOARD_KEY);
  if (!ctx) {
    throw new Error('useRpKeyboard() must be used inside <RpKeyboard>');
  }
  return ctx;
}
