import { defineBoot } from '#q-app/wrappers';
import { LocalStorage } from 'quasar';
import type { Composer } from 'vue-i18n';

import { LOCALE_STORAGE_KEY } from 'src/config/locale';
import { i18n } from 'src/i18n';

export default defineBoot(({ app }) => {
  const saved = LocalStorage.getItem<string>(LOCALE_STORAGE_KEY);
  if (saved === 'tg-TJ' || saved === 'ru-RU') {
    (i18n.global as unknown as Composer).locale.value = saved;
  }
  app.use(i18n);
});
