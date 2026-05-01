<template>
  <section
    class="rp-token-section column items-center"
    aria-labelledby="token-login-heading"
  >
    <!-- PIN-only → затем результат с сервера на 60 с -->
    <div v-if="!qrData" class="rp-token-card column">
      <h2 id="token-login-heading" class="rp-token-title q-mb-sm">
        {{ t('login.tokenPinTitle') }}
      </h2>
      <p class="rp-token-subtitle q-mb-lg">{{ t('login.tokenPinHint') }}</p>

      <div class="rp-token-dots row justify-center q-mb-lg">
        <span
          v-for="i in 6"
          :key="i"
          class="rp-token-dot"
          :class="{ 'rp-token-dot--filled': pin.length >= i }"
        />
      </div>

      <RpNumericTouchpad
        v-model="pin"
        class="rp-token-numpad"
        :disabled="qrLoading"
        :max-length="6"
        size="lg"
        shape="circle"
      />
      <q-spinner v-if="qrLoading" color="primary" size="36px" class="q-mt-md self-center" />
    </div>

    <div v-else class="rp-token-card column items-center rp-token-qr-step">
      <h2 class="rp-token-title self-start q-mb-sm">{{ t('login.tokenQrTitle') }}</h2>
      <p class="rp-token-subtitle self-start q-mb-md">{{ t('login.tokenQrHint') }}</p>

      <div class="rp-token-qr-frame flex flex-center">
        <q-img :src="qrData" fit="contain" class="rp-token-qr-img" alt="" />
      </div>

      <div class="full-width q-mt-md">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-caption text-weight-medium">{{ t('login.tokenQrTimerLabel') }}</span>
          <span class="text-caption">{{ secondsLeft }} {{ t('login.tokenQrSeconds') }}</span>
        </div>
        <q-linear-progress
          :value="timerProgress"
          rounded
          color="primary"
          track-color="secondary"
          class="rp-token-progress"
        />
      </div>

      <div class="row full-width q-gutter-sm q-mt-lg">
        <q-btn
          outline
          no-caps
          class="col"
          icon="download"
          :label="t('login.tokenDownloadQr')"
          @click="getQRData.downloadQrPng"
        />
        <q-btn flat no-caps class="col" :label="t('login.tokenStartOver')" @click="getQRData.wipe" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';
import { useGetQRDataStore } from 'src/stores/get-qr-data';

const { t } = useI18n();
const getQRData = useGetQRDataStore();
const { pin, qrLoading, qrData, secondsLeft, timerProgress } = storeToRefs(getQRData);

onUnmounted(() => getQRData.dispose());
</script>

<style scoped lang="scss">
.rp-token-section {
  width: 100%;
}

.rp-token-card {
  width: 100%;
  max-width: 540px;
  background: var(--rp-card);
  border-radius: 12px;
  padding: 48px;
  gap: 16px;
  box-sizing: border-box;
}

.rp-token-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-token-subtitle {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--rp-muted-foreground);
  line-height: 1.5;
}

.rp-token-dots {
  flex-wrap: wrap;
  gap: clamp(10px, 3vw, 22px);
}

.rp-token-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--rp-muted-foreground);
  background: transparent;
}

.rp-token-dot--filled {
  background: var(--rp-foreground);
  border-color: var(--rp-foreground);
}

.rp-token-numpad {
  margin-top: auto;
}

.rp-token-qr-step {
  max-width: 420px;
}

.rp-token-qr-frame {
  width: 100%;
  max-width: 300px;
  min-height: 300px;
  border-radius: 12px;
  background: var(--rp-secondary);
  border: 1px solid var(--rp-border);
}

.rp-token-qr-img {
  width: 280px;
  height: 280px;
}

.rp-token-progress {
  height: 8px;
}

@media (max-width: 599px) {
  .rp-token-card {
    padding: 24px 20px;
  }
}
</style>
