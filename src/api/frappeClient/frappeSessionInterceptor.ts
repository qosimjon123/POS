import type { AxiosInstance, AxiosError } from 'axios';
import { useLoginStore } from 'src/stores/login';

import { isFrappeSessionTerminated } from 'src/types/frappeStatuses';

const attached = new WeakSet<AxiosInstance>();

export type FrappeSessionRecovery = {
  clearSession: () => Promise<void>;
  /** После очистки: например `router.replace({ name: 'login', ... })` */
  navigateToLogin: () => void | Promise<void>;
};

let recovery: FrappeSessionRecovery | null = null;

export function configureFrappeSessionRecovery(config: FrappeSessionRecovery): void {
  recovery = config;
}

async function drainTerminatedSession(axError: AxiosError): Promise<boolean> {
  const res = axError.response;
  const raw = res?.data;
  const merged =
    typeof raw === 'object' && raw !== null
      ? {
          ...raw,
          httpStatus: res?.status,
          httpStatusText: res?.statusText,
        }
      : { httpStatus: res?.status, httpStatusText: res?.statusText };

  if (!isFrappeSessionTerminated(merged)) return false;

  const r = recovery;
  if (!r) return false;

  await r.clearSession();
  await Promise.resolve(r.navigateToLogin());

  return true;
}

/** Вешается один раз на экземпляр Axios из `FrappeApp`. */
export function attachFrappeUnauthorizedInterceptor(axios: AxiosInstance): void {
  if (attached.has(axios)) return;
  attached.add(axios);

  axios.interceptors.response.use(
    (r) => r,
    async (error: unknown) => {
      const axErr = error as AxiosError;
      try {
        if (await drainTerminatedSession(axErr)) {
          /** Ошибку всё равно режективаем — `try/catch` в вызывающем коде может отличить только по нужде */
          return Promise.reject(axErr);
        }
      } catch {
        /** не ломать цепочку при сбое обработки */
      }
      return Promise.reject(axErr);
    },
  );
}


/**
 * Сервер может отдавать уже готовое значение заголовка (напр. `Basic …`),
 * не «секрет» для схемы `token`/Bearer. frappe-js-sdk собирает только `{type} {token}`,
 * поэтому вешаем интерцептор и подставляем строку как есть при каждом запросе.
 */
export function attachRawAuthorizationHeaderInterceptor(axios: AxiosInstance): void {
  axios.interceptors.request.use((config) => {
    const header = useLoginStore().token;
    if (typeof header === 'string' && header.length > 0) {
      config.headers.Authorization = header;
    }
    return config;
  });
}