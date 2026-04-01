import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTimeStore = defineStore('time', () => {
  const now = ref(Date.now());
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function ensureTick() {
    if (intervalId !== null) return;
    now.value = Date.now();
    intervalId = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }

  function stopTick() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { now, ensureTick, stopTick };
});
