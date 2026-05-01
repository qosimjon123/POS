import { defineStore } from 'pinia';
import QRCode from 'qrcode';
import { computed, ref, watch } from 'vue';
import { Dark } from 'quasar';

import { getQrData } from 'src/api/login/getQRData';

const TTL_MS = 60_000;
const PIN_RE = /^\d{6}$/;

export const useGetQRDataStore = defineStore('get-qr-data', () => {
  const pin = ref('');
  const qrLoading = ref(false);
  const qrData = ref('');
  const expiresAt = ref(0);
  const secondsLeft = ref(0);
  let tickId: ReturnType<typeof setInterval> | null = null;

  const timerProgress = computed(() => {
    if (!expiresAt.value) return 0;
    const left = Math.max(0, expiresAt.value - Date.now());
    return Math.min(1, left / TTL_MS);
  });

  function stopTick() {
    if (tickId != null) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  function wipe() {
    stopTick();
    pin.value = '';
    qrLoading.value = false;
    qrData.value = '';
    expiresAt.value = 0;
    secondsLeft.value = 0;
  }

  async function buildQr() {
    if (!PIN_RE.test(pin.value) || qrLoading.value || qrData.value) return;
    qrLoading.value = true;
    try {
      const blob = await getQrData(pin.value);
      if (!blob) return;

      pin.value = '';
      stopTick();

      qrData.value = await QRCode.toDataURL(blob, {
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
      tickId = setInterval(() => {
        const ms = expiresAt.value - Date.now();
        secondsLeft.value = Math.max(0, Math.ceil(ms / 1000));
        if (ms <= 0) wipe();
      }, 250);
    } finally {
      qrLoading.value = false;
    }
  }

  watch(pin, (p) => {
    if (PIN_RE.test(p)) void buildQr();
  });

  function downloadQrPng() {
    if (!qrData.value) return;
    const a = document.createElement('a');
    a.href = qrData.value;
    a.download = `restropos-token-qr-${Date.now()}.png`;
    a.rel = 'noopener';
    a.click();
  }

  function dispose() {
    wipe();
  }

  return {
    pin,
    qrLoading,
    qrData,
    secondsLeft,
    timerProgress,
    downloadQrPng,
    wipe,
    dispose,
  };
});
