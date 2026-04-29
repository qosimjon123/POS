<template>
  <section
    class="rp-token-section column items-center"
    aria-labelledby="token-login-heading"
  >
    <!-- Шаг 1: логин / пароль → токен -->
    <q-form
      v-if="step === 1"
      class="rp-token-card column"
      @submit.prevent="pairing.submitCredentials"
      autocomplete="off"
    >
      <div class="q-mb-sm">
        <h2 id="token-login-heading" class="rp-token-title">
          {{ t('login.tokenSectionTitle') }}
        </h2>
        <p class="rp-token-subtitle">{{ t('login.tokenSectionSubtitle') }}</p>
      </div>

      <q-input
        v-model="credentialLogin"
        outlined
        class="rp-field"
        :color="!$q.dark.isActive ? 'dark' : 'light'"
        :text-color="!$q.dark.isActive ? 'dark' : 'light'"
        :label="t('login.loginLabel')"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
        @focus="onFieldFocus('login')"
        @blur="onFieldBlur"
      />

      <q-input
        v-model="credentialPassword"
        outlined
        class="rp-field"
        :color="$q.dark.isActive ? 'dark' : 'light'"
        :text-color="$q.dark.isActive ? 'dark' : 'light'"
        :type="showPassword ? 'text' : 'password'"
        :label="t('login.passwordLabel')"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
        @focus="onFieldFocus('password')"
        @blur="onFieldBlur"
      >
        <template #append>
          <q-btn
            flat
            dense
            round
            :icon="showPassword ? 'visibility_off' : 'visibility'"
            :aria-label="showPassword ? t('login.hidePassword') : t('login.showPassword')"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-btn
        unelevated
        no-caps
        class="rp-token-primary full-width q-mt-md"
        type="submit"
        :label="t('login.tokenStep1Continue')"
      />
    </q-form>

    <!-- Шаг 2: PIN 6 цифр -->
    <div v-else-if="step === 2" class="rp-token-card column rp-token-pin-step">
      <div class="rp-token-pin-head row items-start justify-between q-mb-md">
        <div>
          <h2 class="rp-token-title q-mb-xs">{{ t('login.tokenPinTitle') }}</h2>
          <p class="rp-token-subtitle q-mb-none">{{ t('login.tokenPinHint') }}</p>
        </div>
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          :aria-label="t('login.tokenBackCredentials')"
          @click="pairing.goBackToCredentials"
        />
      </div>

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
        :max-length="6"
        size="lg"
        shape="circle"
      />

      <q-btn
        unelevated
        no-caps
        class="rp-token-primary full-width q-mt-lg"
        :disable="pin.length !== 6 || qrLoading"
        :loading="qrLoading"
        :label="t('login.tokenBuildQr')"
        @click="pairing.buildQr"
      />
    </div>

    <!-- Шаг 3: QR + таймер -->
    <div v-else class="rp-token-card column items-center rp-token-qr-step">
      <h2 class="rp-token-title self-start q-mb-sm">{{ t('login.tokenQrTitle') }}</h2>
      <p class="rp-token-subtitle self-start q-mb-md">{{ t('login.tokenQrHint') }}</p>

      <div class="rp-token-qr-frame flex flex-center">
        <q-img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          fit="contain"
          class="rp-token-qr-img"
          spinner-color="primary"
          alt=""
        />
        <q-spinner-dots v-else-if="qrLoading" color="primary" size="48px" />
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

      <q-banner
        v-if="secondsLeft <= 10 && secondsLeft > 0"
        rounded
        class="rp-token-warn full-width q-mt-md"
        dense
      >
        {{ t('login.tokenQrSoonExpire') }}
      </q-banner>

      <div class="row full-width q-gutter-sm q-mt-lg">
        <q-btn
          outline
          no-caps
          class="col"
          icon="download"
          :label="t('login.tokenDownloadQr')"
          :disable="!qrDataUrl"
          @click="pairing.downloadQrPng"
        />
        <q-btn
          flat
          no-caps
          class="col"
          :label="t('login.tokenStartOver')"
          @click="pairing.fullReset"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';
import { useRpKeyboard } from 'src/components/common/keyboard-inject';
import { useTokenPairingStore } from 'src/stores/token-pairing';

const { t } = useI18n();
const pairing = useTokenPairingStore();
const {
  step,
  qrLoading,
  credentialLogin,
  credentialPassword,
  showPassword,
  pin,
  qrDataUrl,
  secondsLeft,
  timerProgress,
} = storeToRefs(pairing);

const kbd = useRpKeyboard();

onUnmounted(() => pairing.dispose());

function onFieldFocus(field: 'login' | 'password') {
  kbd.bindInput(
    () => (field === 'login' ? credentialLogin.value : credentialPassword.value),
    (v) => (field === 'login' ? (credentialLogin.value = v) : (credentialPassword.value = v)),
  );
  kbd.open();
}

function onFieldBlur() {
  kbd.close();
  kbd.resetBinding();
}
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

.rp-token-primary {
  font-size: 17px;
  font-weight: 600;
  min-height: 54px;
  padding: 14px 24px;
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}

.rp-token-pin-step {
  min-height: 420px;
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

.rp-token-warn {
  background: color-mix(in srgb, var(--rp-primary) 12%, var(--rp-card));
  color: var(--rp-foreground);
  border: 1px solid var(--rp-border);
}

.rp-token-demo-banner {
  background: color-mix(in srgb, var(--rp-primary) 8%, var(--rp-card));
  border: 1px solid var(--rp-border);
  color: var(--rp-foreground);
}

.rp-token-network-hint {
  color: var(--rp-muted-foreground);
  line-height: 1.4;
}

@media (max-width: 599px) {
  .rp-token-card {
    padding: 24px 20px;
  }
}
</style>
