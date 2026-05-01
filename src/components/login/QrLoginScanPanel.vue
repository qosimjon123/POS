<template>
  <div class="rp-scan-stack">
    <div class="rp-scanner-status">
      <div class="rp-scanner-icon">
        <q-icon name="qr_code_2" size="32px" class="rp-icon-fg" />
        <span
          class="rp-status-dot"
          :class="scannerReady ? 'rp-status-dot--ok' : 'rp-status-dot--bad'"
          aria-hidden="true"
        />
      </div>
      <div class="rp-scanner-text">
        <h2 id="qr-login-heading" class="rp-scanner-title">
          {{
            scanner.scanning ? t('login.scannerScanning') : t('login.scannerReady')
          }}
        </h2>
        <p class="rp-scanner-desc">{{ t('login.scannerHint') }}</p>
        <div class="rp-scan-actions row q-gutter-sm q-mt-md flex-wrap">
          <q-btn
            v-if="!scanner.scanning"
            :text-color="!$q.dark.isActive ? 'dark' : 'white'"
            :color="$q.dark.isActive ? 'dark' : 'white'"
            class="rp-scan-btn"
            :disable="!scanner.supported"
            :label="t('login.scanQr')"
            @click="onStartScan"
          />
          <q-btn
            v-if="!scanner.scanning"
            class="rp-scan-btn"
            icon="image"
            :disable="fileBusy"
            :loading="fileBusy"
            :label="t('login.scanFromFile')"
            :text-color="!$q.dark.isActive ? 'dark' : 'white'"
            :color="$q.dark.isActive ? 'dark' : 'white'"
            @click="openFilePicker"
          />
          <input
            ref="fileInputRef"
            type="file"
            class="rp-file-input-hidden"
            accept="image/*"
            tabindex="-1"
            aria-hidden="true"
            @change="onFileChange"
          />
          <q-btn
            v-if="scanner.scanning && !isNative"
            class="rp-scan-btn"
            :label="t('login.stopScan')"
            :text-color="!$q.dark.isActive ? 'dark' : 'white'"
            :color="$q.dark.isActive ? 'dark' : 'white'"
            @click="onStopScan"
          />
        </div>
        <p
          v-if="scanner.errorMessage"
          class="rp-scan-error text-negative q-mt-sm q-mb-none"
          role="alert"
        >
          {{ scanner.errorMessage }}
        </p>
      </div>
    </div>

    <video
      v-if="!isNative"
      ref="videoRef"
      class="rp-scan-video"
      :class="{ 'rp-scan-video--hidden': !showLoginScanPreview }"
      muted
      playsinline
    />

    <div class="rp-hint-row row no-wrap items-start">
      <q-icon name="verified_user" size="24px" class="rp-hint-icon q-mt-xs" />
      <span>{{ t('login.shieldHint') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useScanner } from 'src/stores/scanner';
import { useLoginStore } from 'src/stores/login';

const { t } = useI18n();

const login = useLoginStore();
const scanner = useScanner();
const { webPreviewVideoTarget } = scanner;
const videoRef = ref<HTMLVideoElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileBusy = ref(false);
const isNative = Capacitor.isNativePlatform();
const scannerReady = computed(() => scanner.supported);

const showLoginScanPreview = computed(
  () =>
    webPreviewVideoTarget.value !== null &&
    videoRef.value === webPreviewVideoTarget.value,
);

onMounted(() => {
  void scanner.init();
});

onUnmounted(() => {
  void scanner.stopScan();
});

async function onStartScan() {
  const result = await scanner.startScan(videoRef.value ?? null);
  const payload = result?.value?.trim();
  if (payload) login.setQrLoginPayload(payload);
}

function onStopScan() {
  void scanner.stopScan();
}

function openFilePicker() {
  fileInputRef.value?.click();
}

async function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  fileBusy.value = true;
  try {
    const result = await scanner.scanFromFile(file);
    const payload = result?.value?.trim();
    if (payload) login.setQrLoginPayload(payload);
  } finally {
    fileBusy.value = false;
  }
}
</script>

<style scoped lang="scss">
.rp-scan-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.rp-scanner-status {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  background: var(--rp-secondary);
  border-radius: 12px;
  padding: 38px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 23px;
}

.rp-scanner-icon {
  width: 62px;
  height: 62px;
  background: var(--rp-card);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.rp-status-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid var(--rp-secondary);
}

.rp-status-dot--ok {
  background: var(--rp-success);
}

.rp-status-dot--bad {
  background: var(--rp-negative);
}

.rp-scanner-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--rp-foreground);
  line-height: 1.2;
}

.rp-scanner-text {
  min-width: 0;
  width: 100%;
}

.rp-scanner-desc {
  margin: 0;
  font-size: 16px;
  color: var(--rp-secondary-foreground);
  line-height: 1.5;
}

.rp-scan-btn {
  min-width: 140px;
}

.rp-file-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.rp-scan-error {
  font-size: 14px;
  line-height: 1.4;
}

.rp-scan-video {
  width: 100%;
  max-height: 220px;
  border-radius: 8px;
  background: #000;
  object-fit: cover;
}

.rp-scan-video--hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.rp-hint-row {
  flex-shrink: 0;
  min-width: 0;
  gap: 15px;
  color: var(--rp-muted-foreground);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  background: var(--rp-card);
  padding: 24px;
  border-radius: 12px;
  width: 100%;
}

.rp-hint-icon {
  color: var(--rp-success-foreground);
  flex-shrink: 0;
}

.rp-icon-fg {
  color: var(--rp-foreground);
}

@media (max-width: 599px) {
  .rp-scanner-status {
    padding: 24px 20px;
  }

  .rp-scanner-title {
    font-size: 20px;
  }
}
</style>
