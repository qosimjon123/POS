import axios from 'axios';

import { useServerSettingsStore } from 'src/stores/server-settings';

/**
 * Проверка `frappe.ping` отдельным запросом с **`withCredentials: false`**:
 * не отправляет и не подтягивает cookie-сессию Guest через общий клиент frappe-js-sdk,
 * чтобы после `/api/method/login` не смешивался старый Guest sid с пользовательским.
 */
export async function pingServer(): Promise<boolean> {
  const baseUrl = useServerSettingsStore().baseUrl;
  if (!baseUrl) {
    return false;
  }
  const url = `${baseUrl.replace(/\/+$/, '')}/api/method/frappe.ping`;
  try {
    const { data } = await axios.get<{ message?: string }>(url, {
      withCredentials: false,
      timeout: 15_000,
      headers: { Accept: 'application/json' },
    });
    const msg = typeof data?.message === 'string' ? data.message.toLowerCase() : '';
    return msg === 'pong';
  } catch {
    return false;
  }
}
