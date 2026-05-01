import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as CryptoJS from 'crypto-js';
import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEYS } from 'src/config/storage';

export type LoginMode = 'qr' | 'email';

const ENCRYPTION_KEY = 'encryption_key';

export const useLoginStore = defineStore('login', () => {
  const mode = ref<LoginMode>('qr');
  const token = ref<string | null>(null);
  const isLoggedIn = computed(() => token.value !== null);

  /** Сохранить учётные данные: полное значение заголовка `Authorization` с сервера (напр. `Basic …`). */
  async function setToken(plainToken: string) {
    token.value = plainToken;
    const encryptedToken = CryptoJS.AES.encrypt(plainToken, ENCRYPTION_KEY).toString();
    await Preferences.set({
      key: STORAGE_KEYS.LOGIN_TOKEN,
      value: encryptedToken,
    });
  }

  /** Прочитать из Preferences и заполнить `token` (вызывать при старте и при явном обновлении). */
  async function hydrateTokenFromStorage() {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.LOGIN_TOKEN });
    if (!value) {
      token.value = null;
      return;
    }
    try {
      const plain = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      token.value = plain || null;
    } catch {
      token.value = null;
    }
  }

  /** Асинхронно синхронизировать с хранилищем и вернуть токен. */
  async function getToken(): Promise<string | null> {
    await hydrateTokenFromStorage();
    return token.value;
  }

  async function clearToken() {
    token.value = null;
    await Preferences.remove({ key: STORAGE_KEYS.LOGIN_TOKEN });
  }


  const pin = ref('');
  const qrLoginPayload = ref('');
  const loginQrCaptured = computed(() => qrLoginPayload.value.trim().length > 0);
  const mobileStep = ref(1);

  const email = ref('');
  const password = ref('');
  const showPassword = ref(false);

  function resetQrLoginPairing() {
    pin.value = '';
    qrLoginPayload.value = '';
    mobileStep.value = 1;
  }

  function setQrLoginPayload(payload: string) {
    pin.value = '';
    qrLoginPayload.value = payload.trim();
  }

  function setMode(next: LoginMode) {
    if (next === mode.value) return;
    if (mode.value === 'qr' && next === 'email') {
      resetQrLoginPairing();
    }
    mode.value = next;
  }

  function setPin(value: string) {
    pin.value = value;
  }

  function setMobileStep(step: number) {
    mobileStep.value = step;
  }

  return {
    mode,
    token,
    isLoggedIn,
    clearToken,
    pin,
    qrLoginPayload,
    loginQrCaptured,
    mobileStep,
    email,
    password,
    showPassword,
    setMode,
    setQrLoginPayload,
    setPin,
    setMobileStep,
    resetQrLoginPairing,
    setToken,
    getToken,
    hydrateTokenFromStorage,
  };
});
