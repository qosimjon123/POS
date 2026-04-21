import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LocalStorage } from 'quasar';

import { SERVER_BASE_URL_STORAGE_KEY } from 'src/config/server';
import { useConnectionStore } from './connection';

function normalizeBackendUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  return s.replace(/\/+$/, '');
}

export const useServerSettingsStore = defineStore('serverSettings', () => {
  const settingsDialogOpen = ref(false);
  const settingsUrlInvalid = ref(false);
  /** Редактируемое значение в диалоге; в `baseUrl` попадает только после «Сохранить». */
  const dialogDraftBaseUrl = ref('');

  const baseUrl = ref(
    normalizeBackendUrl(
      LocalStorage.getItem<string>(SERVER_BASE_URL_STORAGE_KEY) ?? import.meta.env.VITE_FRAPPE_URL,
    ),
  );

  function isCorrectUrl(url: string): boolean {
    const s = url.trim();
    if (!s) return false;
    try {
      const u = new URL(s);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      return u.hostname.length > 0;
    } catch {
      return false;
    }
  }

  function setBaseUrl(raw: string) {
    const n = normalizeBackendUrl(raw);
    baseUrl.value = n;
    LocalStorage.set(SERVER_BASE_URL_STORAGE_KEY, n);
  }

  function openSettingsDialog() {
    settingsUrlInvalid.value = false;
    dialogDraftBaseUrl.value = baseUrl.value;
    settingsDialogOpen.value = true;
  }

  function closeSettingsDialog() {
    settingsDialogOpen.value = false;
    settingsUrlInvalid.value = false;
  }

  async function saveSettingsFromDialog() {
    const n = normalizeBackendUrl(dialogDraftBaseUrl.value);
    if (!isCorrectUrl(n)) {
      settingsUrlInvalid.value = true;
      return;
    }
    // Сначала новый URL в сторе — иначе `checkConnection` ходит на старый `baseUrl`.
    setBaseUrl(n);
    await useConnectionStore().refreshConnection();
    closeSettingsDialog();
  }

  return {
    baseUrl,
    dialogDraftBaseUrl,
    settingsDialogOpen,
    settingsUrlInvalid,
    setBaseUrl,
    openSettingsDialog,
    closeSettingsDialog,
    saveSettingsFromDialog,
    normalizeBaseUrl: normalizeBackendUrl,
  };
});
