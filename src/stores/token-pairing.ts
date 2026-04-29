import { defineStore } from 'pinia';
import QRCode from 'qrcode';
import { computed, ref } from 'vue';
import { Dark, Notify } from 'quasar';

import { requestTokenPairingQr } from 'src/api/login/tokenPairingClient';
import { i18n } from 'src/i18n';

const PIN_RE = /^\d{6}$/;
const TTL_MS = 5 * 60 * 1000;

function t(key: string) {
  return i18n.global.t(key);
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

type FrappeErrRow = { type?: string; message?: string };

function parsePermissionError(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const errors = (err as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return undefined;
  for (const row of errors) {
    if (!row || typeof row !== 'object') continue;
    const r = row as FrappeErrRow;
    if (r.type === 'PermissionError' && typeof r.message === 'string') {
      return stripHtml(r.message);
    }
  }
  return undefined;
}

function parseFirstFrappeMessage(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const o = err as { errors?: unknown; message?: unknown };
  const errors = o.errors;
  if (Array.isArray(errors) && errors[0] && typeof errors[0] === 'object') {
    const m = (errors[0] as FrappeErrRow).message;
    if (typeof m === 'string' && m.trim()) return stripHtml(m);
  }
  if (typeof o.message === 'string' && o.message.trim()) return stripHtml(o.message);
  return undefined;
}

function isPermissionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const errors = (err as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return false;
  return errors.some((row) => row && typeof row === 'object' && (row as FrappeErrRow).type === 'PermissionError');
}

function notifyBuildQrCatch(err: unknown) {
  console.error(err);
  if (isPermissionError(err)) {
    const cap = parsePermissionError(err);
    Notify.create({
      type: 'negative',
      position: 'top',
      message: t('login.tokenQrPermissionError'),
      ...(cap !== undefined ? { caption: cap } : {}),
    });
    return;
  }
  Notify.create({
    type: 'negative',
    position: 'top',
    message: parseFirstFrappeMessage(err) ?? t('login.tokenQrBuildError'),
  });
}

export const useTokenPairingStore = defineStore('token-pairing', () => {
  const step = ref<1 | 2 | 3>(1);
  const qrLoading = ref(false);
  const credentialLogin = ref('');
  const credentialPassword = ref('');
  const showPassword = ref(false);
  const pin = ref('');
  const qrDataUrl = ref('');
  const expiresAt = ref(0);
  const secondsLeft = ref(0);

  let tickId: ReturnType<typeof setInterval> | null = null;

  const timerProgress = computed(() =>
    Math.max(0, Math.min(1, secondsLeft.value / (TTL_MS / 1000))),
  );

  function stopTicker() {
    if (tickId != null) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  function startTicker() {
    stopTicker();
    tickId = setInterval(() => {
      const left = expiresAt.value - Date.now();
      secondsLeft.value = Math.max(0, Math.ceil(left / 1000));
      if (left <= 0) {
        stopTicker();
        qrDataUrl.value = '';
        pin.value = '';
        credentialLogin.value = '';
        credentialPassword.value = '';
        step.value = 1;
        Notify.create({ type: 'warning', message: t('login.tokenQrExpired'), position: 'top' });
      }
    }, 250);
  }

  function fullReset() {
    stopTicker();
    qrDataUrl.value = '';
    pin.value = '';
    credentialLogin.value = '';
    credentialPassword.value = '';
    expiresAt.value = 0;
    secondsLeft.value = 0;
    step.value = 1;
  }

  function goBackToCredentials() {
    stopTicker();
    pin.value = '';
    qrDataUrl.value = '';
    credentialPassword.value = '';
    step.value = 1;
  }

  /** Очистка при уходе со страницы: интервал и чувствительные поля. */
  function dispose() {
    stopTicker();
    qrDataUrl.value = '';
    pin.value = '';
    credentialLogin.value = '';
    credentialPassword.value = '';
    expiresAt.value = 0;
    secondsLeft.value = 0;
    step.value = 1;
    qrLoading.value = false;
  }

  /** Только переход к PIN; логин/пароль/PIN уходит одним запросом в `buildQr`. */
  function submitCredentials() {
    pin.value = '';
    step.value = 2;
  }

  async function buildQr() {
    if (!PIN_RE.test(pin.value)) return;
    qrLoading.value = true;
    try {
      const blob = await requestTokenPairingQr({
        login: credentialLogin.value.trim(),
        password: credentialPassword.value,
        pin_code: pin.value,
      });
      if (!blob) throw new Error('no encrypted_blob');

      qrDataUrl.value = await QRCode.toDataURL(blob, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: Dark.isActive ? '#f5f5f5' : '#0a0a0a',
          light: Dark.isActive ? '#1a1a1a' : '#ffffff',
        },
      });
      expiresAt.value = Date.now() + TTL_MS;
      secondsLeft.value = Math.ceil(TTL_MS / 1000);
      step.value = 3;
      startTicker();
      pin.value = '';
    } catch (e) {
      notifyBuildQrCatch(e);
    } finally {
      qrLoading.value = false;
    }
  }

  function downloadQrPng() {
    if (!qrDataUrl.value) return;
    const a = document.createElement('a');
    a.href = qrDataUrl.value;
    a.download = `restropos-token-qr-${Date.now()}.png`;
    a.rel = 'noopener';
    a.click();
  }

  return {
    step,
    qrLoading,
    credentialLogin,
    credentialPassword,
    showPassword,
    pin,
    qrDataUrl,
    expiresAt,
    secondsLeft,
    timerProgress,
    submitCredentials,
    buildQr,
    fullReset,
    goBackToCredentials,
    downloadQrPng,
    dispose,
  };
});
