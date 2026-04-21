import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { FrappeApp } from 'frappe-js-sdk';
import { useServerSettingsStore } from 'src/stores/server-settings';

/** SDK всегда шлёт `/api/method/...`; Frappe v2 ожидает `/api/v2/method/...`. */
const API_METHOD_PREFIX = '/api/method/';
const API_V2_METHOD_PREFIX = '/api/v2/method/';

/**
 * Сессионная авторизация frappe-js-sdk (`login`, `logout`, `get_logged_user`) остаётся на v1;
 * в v2 эти маршруты часто отсутствуют или ведут себя иначе.
 */
const V1_ONLY_METHOD_PATHS = new Set([
  'login',
  'logout',
  'frappe.auth.get_logged_user',
]);

const v2MethodInterceptorAttached = new WeakMap<AxiosInstance, true>();

function attachFrappeV2MethodUrlRewrite(axios: AxiosInstance): void {
  if (v2MethodInterceptorAttached.has(axios)) {
    return;
  }
  v2MethodInterceptorAttached.set(axios, true);
  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const u = config.url;
    if (typeof u === 'string' && u.startsWith(API_METHOD_PREFIX)) {
      const pathAfterPrefix = u.slice(API_METHOD_PREFIX.length).split('?')[0] ?? '';
      if (!V1_ONLY_METHOD_PATHS.has(pathAfterPrefix)) {
        config.url = API_V2_METHOD_PREFIX + u.slice(API_METHOD_PREFIX.length);
      }
    }
    return config;
  });
}

let frappeApp: FrappeApp | null = null;

/** Сброс экземпляра после logout. */
export function resetFrappeApp(): void {
  frappeApp = null;
}

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
    attachFrappeV2MethodUrlRewrite(frappeApp.axios);
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
