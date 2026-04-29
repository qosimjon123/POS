import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  getLoggedInUsername,
  loginWithUsernamePassword,
  logoutCurrentUser,
} from 'src/api/frappeClient/authClient';
import { resetFrappeApp } from 'src/api/frappeClient/backendClient';
import { createSingleFlight } from 'src/utils/singleFlight';

export type LoginMode = 'qr' | 'email';

export const useLoginStore = defineStore('login', () => {
  const mode = ref<LoginMode>('qr');
  /** Имя пользователя Frappe после успешного `loginWithFrappe` (cookie-сессия). */
  const frappeUser = ref<string | null>(null);
  const authReady = ref(false);
  const authChecking = ref(false);
  const refreshSessionFlight = createSingleFlight<boolean>();

  const isLoggedIn = computed(() => frappeUser.value !== null);

  function normalizeFrappeUser(user: string | null): string | null {
    if (!user || user === 'Guest') return null;
    return user;
  }

  function markLoggedOut() {
    frappeUser.value = null;
    authReady.value = true;
  }

  /**
   * Логин через Frappe `/api/method/login` (frappe-js-sdk).
   * Нужен URL: из настроек сервера или `VITE_FRAPPE_URL`; иначе метод ничего не делает.
   */
  async function loginWithPassword(username: string, password: string): Promise<void> {
    resetFrappeApp();
    const user = normalizeFrappeUser(await loginWithUsernamePassword(username, password));
    if (!user) {
      markLoggedOut();
      throw new Error('Not authenticated');
    }
    frappeUser.value = user;
    authReady.value = true;
  }


  async function logoutFrappe(): Promise<void> {
    await logoutCurrentUser();
    markLoggedOut();
  }

  async function refreshSession(): Promise<boolean> {
    return refreshSessionFlight.run(async () => {
      authChecking.value = true;
      try {
        frappeUser.value = normalizeFrappeUser(await getLoggedInUsername());
        authReady.value = true;
        return frappeUser.value !== null;
      } catch {
        markLoggedOut();
        return false;
      } finally {
        authChecking.value = false;
      }
    });
  }

  async function ensureSession(): Promise<boolean> {
    if (authReady.value) return isLoggedIn.value;
    return refreshSession();
  }

  function handleAuthFailure() {
    markLoggedOut();
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
    authReady,
    authChecking,
    isLoggedIn,
    loginWithPassword,
    logoutFrappe,
    refreshSession,
    ensureSession,
    handleAuthFailure,
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
