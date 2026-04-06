import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { LocalStorage } from 'quasar';

import { SERVER_BASE_URL_STORAGE_KEY } from 'src/config/server';

export function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

function readInitialBaseUrl(): string {
  const saved = LocalStorage.getItem<string>(SERVER_BASE_URL_STORAGE_KEY);
  return saved ? normalizeBaseUrl(saved) : '';
}

/**
 * Shared Axios instance for the app (Frappe / REST API).
 * Base URL is hydrated from LocalStorage; `useServerSettingsStore().setBaseUrl` keeps it in sync.
 */
export const api: AxiosInstance = axios.create({
  baseURL: readInitialBaseUrl(),
  timeout: 60_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 300,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Central place for logging, toast, or mapping errors — extend as needed.
    return Promise.reject(error);
  },
);
