import { defineStore } from 'pinia';
import { ref } from 'vue';

export type LoginMode = 'qr' | 'email';

export const useLoginStore = defineStore('login', () => {
  const mode = ref<LoginMode>('qr');

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
