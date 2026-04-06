import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

import { api } from 'src/api/http';
import { useServerSettingsStore } from 'src/stores/server-settings';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export default defineBoot(({ app }) => {
  useServerSettingsStore().hydrateFromStorage();

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
