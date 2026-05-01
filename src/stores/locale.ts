import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LocalStorage } from 'quasar';

import { STORAGE_KEYS } from 'src/config/storage';
import { i18n, isMessageLanguage, type MessageLanguages } from 'src/i18n';

type I18nLocaleTarget = {
  locale: MessageLanguages | { value: MessageLanguages };
};

function localeTarget(): I18nLocaleTarget {
  return i18n.global as unknown as I18nLocaleTarget;
}

function getAppliedLocale(): MessageLanguages {
  const target = localeTarget().locale;
  return typeof target === 'string' ? target : target.value;
}

function applyLocale(code: MessageLanguages) {
  const target = localeTarget();
  if (typeof target.locale === 'string') {
    target.locale = code;
    return;
  }
  target.locale.value = code;
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<MessageLanguages>('ru-RU');

  function hydrateFromStorage() {
    const saved = LocalStorage.getItem<string>(STORAGE_KEYS.LOCALE);
    if (saved && isMessageLanguage(saved)) {
      locale.value = saved;
      applyLocale(saved);
    } else {
      locale.value = getAppliedLocale();
    }
  }

  function setLocale(code: MessageLanguages) {
    locale.value = code;
    LocalStorage.set(STORAGE_KEYS.LOCALE, code);
    applyLocale(code);
  }

  return { locale, setLocale, hydrateFromStorage };
});
