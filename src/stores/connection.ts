import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConnectionStore = defineStore('connection', () => {
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

  function syncFromNavigator() {
    online.value = navigator.onLine;
  }

  function bindWindowEvents() {
    window.addEventListener('online', syncFromNavigator);
    window.addEventListener('offline', syncFromNavigator);
  }

  function unbindWindowEvents() {
    window.removeEventListener('online', syncFromNavigator);
    window.removeEventListener('offline', syncFromNavigator);
  }

  return { online, syncFromNavigator, bindWindowEvents, unbindWindowEvents };
});
