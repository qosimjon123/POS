import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Dark, LocalStorage } from 'quasar';

const STORAGE_KEY = 'rp-theme-dark';

export const useThemeStore = defineStore('theme', () => {
  const dark = ref(Dark.isActive);

  function applyDark(value: boolean) {
    Dark.set(value);
    LocalStorage.set(STORAGE_KEY, value);
    dark.value = value;
  }

  function toggle() {
    applyDark(!Dark.isActive);
  }

  function hydrateFromStorage() {
    if (LocalStorage.hasItem(STORAGE_KEY)) {
      const v = LocalStorage.getItem<boolean>(STORAGE_KEY)!;
      Dark.set(v);
      dark.value = v;
    }
  }

  return { dark, toggle, applyDark, hydrateFromStorage };
});
