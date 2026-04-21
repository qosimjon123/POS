import { FrappeApp } from 'frappe-js-sdk';
import { useServerSettingsStore } from 'src/stores/server-settings';

let frappeApp: FrappeApp | null = null;
/**
 * Единая точка доступа к frappe-js-sdk: auth(), db(), call(), file().
 * Whitelist методов на бэкенде; call: get/post/put/delete.
 */
export function getFrappeApp(): FrappeApp | null {
  const url = useServerSettingsStore().baseUrl;
  if (!url) {
    return null;
  }
  if (!frappeApp || frappeApp.url !== url) {
    frappeApp = new FrappeApp(url);
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
