import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LocalStorage } from 'quasar';

import { api } from 'src/boot/axios';
import { SERVER_BASE_URL_STORAGE_KEY } from 'src/config/server';

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

export const useServerSettingsStore = defineStore('serverSettings', () => {
  const baseUrl = ref(
    normalizeBaseUrl(
      LocalStorage.getItem<string>(SERVER_BASE_URL_STORAGE_KEY) ?? '',
    ),
  );

  const settingsDialogOpen = ref(false);
  const settingsDraftUrl = ref('');
  const settingsUrlInvalid = ref(false);

  function applyToAxios() {
    api.defaults.baseURL = baseUrl.value || '';
  }

  function setBaseUrl(raw: string) {
    const n = normalizeBaseUrl(raw);
    baseUrl.value = n;
    if (n) {
      LocalStorage.set(SERVER_BASE_URL_STORAGE_KEY, n);
    } else {
      LocalStorage.remove(SERVER_BASE_URL_STORAGE_KEY);
    }
    applyToAxios();
  }

  function hydrateFromStorage() {
    const v = LocalStorage.getItem<string>(SERVER_BASE_URL_STORAGE_KEY) ?? '';
    baseUrl.value = normalizeBaseUrl(v);
    applyToAxios();
  }

  function openSettingsDialog() {
    settingsDraftUrl.value = baseUrl.value;
    settingsUrlInvalid.value = false;
    settingsDialogOpen.value = true;
  }

  function closeSettingsDialog() {
    settingsDialogOpen.value = false;
    settingsUrlInvalid.value = false;
  }

  function saveSettingsFromDialog() {
    settingsUrlInvalid.value = false;
    const raw = settingsDraftUrl.value.trim();
    if (!raw) {
      setBaseUrl('');
      closeSettingsDialog();
      return;
    }
    try {
      const u = new URL(raw);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        settingsUrlInvalid.value = true;
        return;
      }
    } catch {
      settingsUrlInvalid.value = true;
      return;
    }
    setBaseUrl(raw);
    closeSettingsDialog();
  }

  return {
    baseUrl,
    settingsDialogOpen,
    settingsDraftUrl,
    settingsUrlInvalid,
    setBaseUrl,
    hydrateFromStorage,
    applyToAxios,
    openSettingsDialog,
    closeSettingsDialog,
    saveSettingsFromDialog,
  };
});
