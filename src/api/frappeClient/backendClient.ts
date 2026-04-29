import type { FrappeApp } from 'frappe-js-sdk';
import { useServerSettingsStore } from 'src/stores/server-settings';

import { createFrappeApp } from './transport';

let frappeApp: FrappeApp | null = null;

export function resetFrappeApp(): void {
  frappeApp = null;
}

export function getFrappeApp(): FrappeApp | null {
  const url = useServerSettingsStore().baseUrl;
  if (!url) return null;
  if (!frappeApp || frappeApp.url !== url) {
    frappeApp = createFrappeApp(url);
  }
  return frappeApp;
}

export function getFrappeCall() {
  return getFrappeApp()?.call() ?? null;
}

export function getFrappeDb() {
  return getFrappeApp()?.db() ?? null;
}

export function getFrappeAuth() {
  return getFrappeApp()?.auth() ?? null;
}

export function getFrappeFileUpload() {
  return getFrappeApp()?.file() ?? null;
}
