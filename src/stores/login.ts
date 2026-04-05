import { defineStore } from 'pinia';
import { ref } from 'vue';

export type LoginMode = 'qr' | 'email';

export const useLoginStore = defineStore('login', () => {
  const mode = ref<LoginMode>('qr');

  const scanned = ref(false);
  const pin = ref('');
  const mobileStep = ref(1);

  const email = ref('');
  const password = ref('');
  const showPassword = ref(false);

  function resetQrFlow() {
    scanned.value = false;
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

  function setPin(value: string) {
    pin.value = value;
  }

  function setMobileStep(step: number) {
    mobileStep.value = step;
  }

  return {
    mode,
    scanned,
    pin,
    mobileStep,
    email,
    password,
    showPassword,
    setMode,
    setScanned,
    setPin,
    setMobileStep,
    resetQrFlow,
  };
});
