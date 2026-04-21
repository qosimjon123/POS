import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { getFrappeApp, resetFrappeApp } from 'src/api/frappeClient/backendClient';
import { getFrappeUrl } from 'src/config/frappe-url';
import { useServerSettingsStore } from 'src/stores/server-settings';

export type LoginMode = 'qr' | 'email';

export const useLoginStore = defineStore('login', () => {
  const serverSettings = useServerSettingsStore();

  const mode = ref<LoginMode>('qr');

  /** Имя пользователя Frappe после успешного `loginWithFrappe` (cookie-сессия). */
  const frappeUser = ref<string | null>(null);

  /** URL из настроек пользователя перекрывает `VITE_FRAPPE_URL`. */
  const hasFrappeBackend = computed(() => !!getFrappeUrl(serverSettings.baseUrl));

  /**
   * Логин через Frappe `/api/method/login` (frappe-js-sdk).
   * Нужен URL: из настроек сервера или `VITE_FRAPPE_URL`; иначе метод ничего не делает.
   */
  async function loginWithFrappe(username: string, password: string): Promise<void> {
    const frappe = getFrappeApp();
    if (!frappe) {
      return;
    }
    const auth = frappe.auth();
    await auth.loginWithUsernamePassword({ username: username.trim(), password });
    const user = await auth.getLoggedInUser();
    frappeUser.value = user;
  }

  async function logoutFrappe(): Promise<void> {
    const frappe = getFrappeApp();
    if (!frappe) {
      frappeUser.value = null;
      return;
    }
    await frappe.auth().logout();
    frappeUser.value = null;
    resetFrappeApp();
  }

  const scanned = ref(false);
  /** JSON-строка конверта v1 со страницы «Ключ и QR» (после скана / файла). */
  const qrPairingEnvelope = ref<string | null>(null);
  const pin = ref('');
  const mobileStep = ref(1);

  const email = ref('');
  const password = ref('');
  const showPassword = ref(false);

  function resetQrFlow() {
    scanned.value = false;
    qrPairingEnvelope.value = null;
    pin.value = '';
    mobileStep.value = 1;
  }

  function setMode(next: LoginMode) {
    if (next === mode.value) return;
    if (mode.value === 'qr' && next === 'email') {
      resetQrFlow();
    }
    mode.value = next;
  }

  function setScanned(value: boolean) {
    scanned.value = value;
  }

  function setQrPairingEnvelope(raw: string | null) {
    qrPairingEnvelope.value = raw;
  }

  function setPin(value: string) {
    pin.value = value;
  }

  function setMobileStep(step: number) {
    mobileStep.value = step;
  }

  return {
    mode,
    frappeUser,
    hasFrappeBackend,
    loginWithFrappe,
    logoutFrappe,
    scanned,
    qrPairingEnvelope,
    pin,
    mobileStep,
    email,
    password,
    showPassword,
    setMode,
    setScanned,
    setQrPairingEnvelope,
    setPin,
    setMobileStep,
    resetQrFlow,
  };
});
