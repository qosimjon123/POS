import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { FrappeApp } from 'frappe-js-sdk';

import {
  getFrappeAuthFailureEvent,
  handleFrappeAuthFailure,
} from './authSessionAdapter';
import { handleFrappeRequestStatus } from './statusAdapter';
import { rewriteMethodUrlToV2 } from './methodPaths';

const axiosEnhanced = new WeakMap<AxiosInstance, true>();

export function attachFrappeAxiosInterceptors(axios: AxiosInstance): void {
  if (axiosEnhanced.has(axios)) return;
  axiosEnhanced.set(axios, true);

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const u = config.url;
    if (typeof u === 'string') {
      config.url = rewriteMethodUrlToV2(u);
    }
    return config;
  });

  axios.interceptors.response.use(
    (res: AxiosResponse) => {
      handleFrappeRequestStatus(res.status);
      return res;
    },
    (err: AxiosError) => {
      const st = typeof err.response?.status === 'number' ? err.response.status : 0;
      handleFrappeRequestStatus(st);
      const authFailure = getFrappeAuthFailureEvent(err);
      if (authFailure) {
        handleFrappeAuthFailure(authFailure);
      }
      return Promise.reject(err);
    },
  );
}

export function createFrappeApp(baseUrl: string): FrappeApp {
  const app = new FrappeApp(baseUrl);
  attachFrappeAxiosInterceptors(app.axios);
  return app;
}
