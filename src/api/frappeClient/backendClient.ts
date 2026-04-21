import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse  } from 'axios';
import { FrappeApp } from 'frappe-js-sdk';
import { useConnectionStore } from 'src/stores/connection';
import { useServerSettingsStore } from 'src/stores/server-settings';

const API_METHOD_PREFIX = '/api/method/';
const API_V2_METHOD_PREFIX = '/api/v2/method/';

const V1_ONLY_METHOD_PATHS = new Set([
  'login',
  'logout',
  'frappe.auth.get_logged_user',
]);

const axiosEnhanced = new WeakMap<AxiosInstance, true>();


function attachAxiosInterceptors(axios: AxiosInstance) {
  if (axiosEnhanced.has(axios)) return;
  axiosEnhanced.set(axios, true);

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const u = config.url;
    if (typeof u === 'string' && u.startsWith(API_METHOD_PREFIX)) {
      const path = u.slice(API_METHOD_PREFIX.length).split('?')[0] ?? '';
      if (!V1_ONLY_METHOD_PATHS.has(path)) {
        config.url = API_V2_METHOD_PREFIX + u.slice(API_METHOD_PREFIX.length);
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (res: AxiosResponse) => {
      useConnectionStore().handleFrappeRequestStatus(res.status);
      return res;
    },
    (err: AxiosError) => {
      const st = typeof err.response?.status === 'number' ? err.response.status : 0;
      useConnectionStore().handleFrappeRequestStatus(st);
      return Promise.reject(err);
    },
  );
}

let frappeApp: FrappeApp | null = null;

export function resetFrappeApp(): void {
  frappeApp = null;
}

export function getFrappeApp(): FrappeApp | null {
  const url = useServerSettingsStore().baseUrl;
  if (!url) return null;
  if (!frappeApp || frappeApp.url !== url) {
    frappeApp = new FrappeApp(url);
    attachAxiosInterceptors(frappeApp.axios);
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
