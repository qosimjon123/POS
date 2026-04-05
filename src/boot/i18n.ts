import { defineBoot } from '#q-app/wrappers';

import { i18n } from 'src/i18n';
import { useLocaleStore } from 'src/stores/locale';

export default defineBoot(({ app }) => {
  app.use(i18n);
  useLocaleStore().hydrateFromStorage();
});
