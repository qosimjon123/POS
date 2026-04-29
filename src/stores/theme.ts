import { computed } from 'vue';
import { defineStore } from 'pinia';
import { Dark, LocalStorage } from 'quasar';

import { STORAGE_KEYS } from 'src/config/storage';

const STORAGE_KEY = STORAGE_KEYS.THEME_DARK;

export const useThemeStore = defineStore('theme', () => {
  /** Mirrors Quasar Dark plugin (single source of truth). */
  const dark = computed(() => Dark.isActive);

  function applyDark(value: boolean) {
    Dark.set(value);
    LocalStorage.set(STORAGE_KEY, value);
  }

  function toggle() {
    applyDark(!Dark.isActive);
  }

  function hydrateFromStorage() {
    if (LocalStorage.hasItem(STORAGE_KEY)) {
      const v = LocalStorage.getItem<boolean>(STORAGE_KEY)!;
      Dark.set(v);
    }
  }

  return { dark, toggle, applyDark, hydrateFromStorage };
});
