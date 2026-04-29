import { defineStore } from 'pinia';
import { ref } from 'vue';

import { pingServer } from 'src/api/pingServer';

/** Период опроса `frappe.ping`: только статус сервера, не «есть ли сеть у клиента». */
const DEFAULT_PING_MS = 2_000;

/** HTTP-ответ от Frappe (не обрыв сети): считаем сервер доступным. */
function isFrappeReachableHttpStatus(status: number): boolean {
  return status >= 200 && status < 500;
}

export const useConnectionStore = defineStore('connection', () => {
  /** `true` / `false` — ответ сервера; `null` — ещё не проверяли или идёт первая проверка. */
  const serverConnected = ref<boolean | null>(null);

  /** Один активный интервал опроса (синглтон). */
  let intervalId: ReturnType<typeof setInterval> | null = null;

  /** Параллельные вызовы (сохранение URL + тик интервала) делят один `ping`. */
  let refreshInFlight: Promise<void> | null = null;

  async function refreshConnection() {
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const ok = await pingServer();
        serverConnected.value = ok;
        if (ok) {
          stopPingTimeout();
        }
      })().finally(() => {
        refreshInFlight = null;
      });
    }
    await refreshInFlight;
  }

  /** Снять периодический опрос; «таймер» в выключенном состоянии. */
  function stopPingTimeout() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  /**
   * Включить периодический опрос. Повторный вызов не создаёт второй интервал:
   * сначала сбрасывается предыдущий, затем один новый.
   */
  function startPingTimeout() {
    stopPingTimeout();
    const pingIntervalMs = DEFAULT_PING_MS;

    void refreshConnection();

    intervalId = setInterval(() => {
      void refreshConnection();
    }, pingIntervalMs);
  }

  /**
   * Ответы через общий клиент frappe-js-sdk (не через отдельный `pingServer`).
   * Успешный статус гасит интервал опроса; при ошибке запускает его снова (если ещё не идёт).
   */
  function handleFrappeRequestStatus(status: number) {
    if (isFrappeReachableHttpStatus(status)) {
      serverConnected.value = true;
      stopPingTimeout();
      return;
    }

    serverConnected.value = false;
    if (intervalId === null) {
      startPingTimeout();
    }
  }

  return {
    serverConnected,
    refreshConnection,
    handleFrappeRequestStatus,
    startPingTimeout,
    stopPingTimeout,
  };
});
