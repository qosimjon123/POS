import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LocalStorage } from 'quasar';
import type { Composer } from 'vue-i18n';

import { LOCALE_STORAGE_KEY } from 'src/config/locale';
import { i18n, type MessageLanguages } from 'src/i18n';

function applyLocale(code: MessageLanguages) {
  (i18n.global as unknown as Composer).locale.value = code;
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<MessageLanguages>('ru-RU');

  function hydrateFromStorage() {
    const saved = LocalStorage.getItem<string>(LOCALE_STORAGE_KEY);
    if (saved === 'tg-TJ' || saved === 'ru-RU') {
      locale.value = saved;
      applyLocale(saved);
    } else {
      locale.value = (i18n.global as unknown as Composer).locale
        .value as MessageLanguages;
    }
  }

  function setLocale(code: MessageLanguages) {
    locale.value = code;
    LocalStorage.set(LOCALE_STORAGE_KEY, code);
    applyLocale(code);
  }

  return { locale, setLocale, hydrateFromStorage };
});
