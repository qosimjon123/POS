import { defineStore } from 'pinia';
import { ref } from 'vue';

import { checkConnection } from 'src/api/connectionCheck';

/** Период опроса `frappe.ping`: только статус сервера, не «есть ли сеть у клиента». */
const DEFAULT_PING_MS = 30_000;

export const useConnectionStore = defineStore('connection', () => {
  /** `true` / `false` — ответ сервера; `null` — ещё не проверяли или идёт первая проверка. */
  const serverConnected = ref<boolean | null>(null);

  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function refreshConnection() {
    serverConnected.value = await checkConnection();
  }

  /**
   * Мониторинг только доступности Frappe (HTTP ping).
   * Чтобы быстрее заметить падение сервера — уменьшите `pingIntervalMs` или подключите Socket.IO.
   */
  function startMonitoring(options?: { pingIntervalMs?: number }) {
    stopMonitoring();
    const pingIntervalMs = options?.pingIntervalMs ?? DEFAULT_PING_MS;

    void refreshConnection();

    intervalId = setInterval(() => {
      void refreshConnection();
    }, pingIntervalMs);
  }

  function stopMonitoring() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return {
    serverConnected,
    refreshConnection,
    startMonitoring,
    stopMonitoring,
  };
});
