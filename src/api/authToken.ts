import axios from 'axios';

/** Ответ сервера: ключ для шифрования PIN (токен / API key). */
export type LoginTokenResponse = {
  token: string;
};

/**
 * Логин + пароль → сервер возвращает ключ (`token`).
 * Его же передаём в `buildEncryptedQrPayload` для AES-GCM по PIN.
 * Эндпоинт при `VITE_API_BASE`: POST `{base}/auth/token` body `{ login, password }`.
 */
export async function fetchSessionToken(login: string, password: string): Promise<string> {
  const base = import.meta.env.VITE_API_BASE as string | undefined;
  if (base) {
    const { data } = await axios.post<LoginTokenResponse>(
      `${base.replace(/\/$/, '')}/auth/token`,
      {
        login,
        password,
      },
    );
    if (!data?.token) {
      throw new Error('Token missing in response');
    }
    return data.token;
  }

  /* Демо без бэкенда: имитация задержки сети */
  await new Promise((r) => setTimeout(r, 450));
  if (!login.trim() || !password) {
    throw new Error('Invalid credentials');
  }
  const raw = `${login.trim()}:${Date.now()}`;
  const bytes = new TextEncoder().encode(raw);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return `demo.${btoa(bin)}`;
}
