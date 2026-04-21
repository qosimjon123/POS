import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { checkConnection } from 'src/api/connectionCheck';

export const useConnectionStore = defineStore('connection', () => {
  /** Сеть браузера (`navigator.onLine`). */
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

  /** Frappe ответил на `frappe.ping`; `null` — ещё не проверяли. */
  const frappeReachable = ref<boolean | null>(null);

  async function refreshFrappePing() {
    if (!online.value) {
      frappeReachable.value = false;
      return;
    }
    frappeReachable.value = await checkConnection();
  }

  function syncFromNavigator() {
    online.value = navigator.onLine;
    void refreshFrappePing();
  }

  function bindWindowEvents() {
    window.addEventListener('online', syncFromNavigator);
    window.addEventListener('offline', syncFromNavigator);
  }

  function unbindWindowEvents() {
    window.removeEventListener('online', syncFromNavigator);
    window.removeEventListener('offline', syncFromNavigator);
  }

  /** Онлайн в браузере и успешный `frappe.ping`. */
  const serverConnected = computed(() => online.value && frappeReachable.value === true);

  return {
    online,
    frappeReachable,
    serverConnected,
    refreshFrappePing,
    syncFromNavigator,
    bindWindowEvents,
    unbindWindowEvents,
  };
});
