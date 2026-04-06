import { Capacitor } from '@capacitor/core';

/**
 * На нативных Android/iOS обычно достаточно системной клавиатуры.
 * Виртуальная клавиатура (simple-keyboard) нужна в основном для PWA/киоска в браузере.
 */
export function shouldUseVirtualKeyboard(force = false): boolean {
  if (force) return true;
  return !Capacitor.isNativePlatform();
}
