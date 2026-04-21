<template>
  <section
    class="rp-token-section column items-center"
    aria-labelledby="token-login-heading"
  >
    <!-- Шаг 1: логин / пароль → токен -->
    <q-form
      v-if="step === 1"
      class="rp-token-card column"
      @submit.prevent="onFetchToken"
      autocomplete="off"
    >
      <div class="q-mb-sm">
        <h2 id="token-login-heading" class="rp-token-title">
          {{ t('login.tokenSectionTitle') }}
        </h2>
        <p class="rp-token-subtitle">{{ t('login.tokenSectionSubtitle') }}</p>
      </div>

      <q-banner
        v-if="showDemoPairingHint"
        rounded
        dense
        class="rp-token-demo-banner q-mb-sm"
      >
        <template #avatar>
          <q-icon name="info" color="primary" />
        </template>
        <div class="text-body2">
          {{ t('login.tokenDemoHint', { login: DEMO_PAIRING_LOGIN, password: DEMO_PAIRING_PASSWORD }) }}
        </div>
        <template #action>
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            :label="t('login.tokenDemoFill')"
            @click="fillDemoCredentials"
          />
        </template>
      </q-banner>

      <q-input
        v-model="credentialLogin"
        outlined
        class="rp-field"
        :color="!$q.dark.isActive ? 'dark' : 'light'"
        :text-color="!$q.dark.isActive ? 'dark' : 'light'"
        :label="t('login.loginLabel')"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
        :disable="loading"
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
        :disable="loading"
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
        :loading="loading"
        :label="t('login.tokenGetToken')"
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
          @click="goBackToCredentials"
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
        @click="onBuildQr"
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
          @click="downloadQrPng"
        />
        <q-btn
          flat
          no-caps
          class="col"
          :label="t('login.tokenStartOver')"
          @click="fullReset"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';
import { computed, onUnmounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';
import { useRpKeyboard } from 'src/components/common/keyboard-inject';
import { getFrappeApp } from 'src/api/frappeClient/backendClient';
import { DEMO_PAIRING_LOGIN, DEMO_PAIRING_PASSWORD } from 'src/constants/demoPairingAccount';
import { TOKEN_QR_TTL_MS, buildEncryptedQrPayload } from 'src/utils/pinQrCrypto';

const $q = useQuasar();
const { t } = useI18n();

const kbd = useRpKeyboard();

const step = ref<1 | 2 | 3>(1);
const loading = ref(false);
const qrLoading = ref(false);

/** Поля только этой страницы — не связаны с формой входа в приложение. */
const credentialLogin = ref('');
const credentialPassword = ref('');
const showPassword = ref(false);

const showDemoPairingHint = computed(
  () => !(import.meta.env.VITE_API_BASE as string | undefined)?.trim(),
);

function fillDemoCredentials() {
  credentialLogin.value = DEMO_PAIRING_LOGIN;
  credentialPassword.value = DEMO_PAIRING_PASSWORD;
}

/** Ключ с сервера (токен / API key), им шифруется PIN перед выводом в QR. */
const sessionToken = ref('');
const pin = ref('');
const qrDataUrl = ref('');
const expiresAt = ref(0);
const secondsLeft = ref(0);

let tickId: ReturnType<typeof setInterval> | null = null;

const timerProgress = computed(() =>
  Math.max(0, Math.min(1, secondsLeft.value / (TOKEN_QR_TTL_MS / 1000))),
);

function stopTicker() {
  if (tickId !== null) {
    clearInterval(tickId);
    tickId = null;
  }
}

function startTicker() {
  stopTicker();
  tickId = setInterval(() => {
    const leftMs = expiresAt.value - Date.now();
    secondsLeft.value = Math.max(0, Math.ceil(leftMs / 1000));
    if (leftMs <= 0) {
      stopTicker();
      onQrExpired();
    }
  }, 250);
}

function onQrExpired() {
  qrDataUrl.value = '';
  sessionToken.value = '';
  pin.value = '';
  credentialLogin.value = '';
  credentialPassword.value = '';
  step.value = 1;
  $q.notify({
    type: 'warning',
    message: t('login.tokenQrExpired'),
    position: 'top',
  });
}

function fullReset() {
  stopTicker();
  qrDataUrl.value = '';
  sessionToken.value = '';
  pin.value = '';
  credentialLogin.value = '';
  credentialPassword.value = '';
  expiresAt.value = 0;
  secondsLeft.value = 0;
  step.value = 1;
}

function goBackToCredentials() {
  stopTicker();
  sessionToken.value = '';
  pin.value = '';
  qrDataUrl.value = '';
  credentialPassword.value = '';
  step.value = 1;
}

onUnmounted(() => {
  stopTicker();
  sessionToken.value = '';
  pin.value = '';
  qrDataUrl.value = '';
  credentialPassword.value = '';
  expiresAt.value = 0;
});

function onFieldFocus(field: 'login' | 'password') {
  if (field === 'login') {
    kbd.bindInput(
      () => credentialLogin.value,
      (v) => {
        credentialLogin.value = v;
      },
    );
  } else {
    kbd.bindInput(
      () => credentialPassword.value,
      (v) => {
        credentialPassword.value = v;
      },
    );
  }
  kbd.open();
}

function onFieldBlur() {
  kbd.close();
  kbd.resetBinding();
}

async function onFetchToken() {
  loading.value = true;
  try {
    const frappe = getFrappeApp();
    if (!frappe) {
      $q.notify({
        type: 'negative',
        message: t('login.tokenFetchError'),
        position: 'top',
      });
      return;
    }
    await frappe.auth().loginWithUsernamePassword({
      username: credentialLogin.value.trim(),
      password: credentialPassword.value,
    });
    sessionToken.value = await frappe.auth().getLoggedInUser();
    pin.value = '';
    step.value = 2;
  } catch (e) {
    console.error(e);
    $q.notify({
      type: 'negative',
      message: t('login.tokenFetchError'),
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

async function onBuildQr() {
  if (!sessionToken.value || pin.value.length !== 6) return;
  if (!globalThis.crypto?.subtle) {
    $q.notify({
      type: 'negative',
      message: t('login.tokenCryptoUnavailable'),
      position: 'top',
    });
    return;
  }

  qrLoading.value = true;
  try {
    const payload = await buildEncryptedQrPayload(sessionToken.value, pin.value);
    const url = await QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: $q.dark.isActive ? '#f5f5f5' : '#0a0a0a',
        light: $q.dark.isActive ? '#1a1a1a' : '#ffffff',
      },
    });
    qrDataUrl.value = url;
    expiresAt.value = Date.now() + TOKEN_QR_TTL_MS;
    secondsLeft.value = Math.ceil(TOKEN_QR_TTL_MS / 1000);
    step.value = 3;
    startTicker();
    pin.value = '';
    sessionToken.value = '';
  } catch (e) {
    console.error(e);
    $q.notify({
      type: 'negative',
      message: t('login.tokenQrBuildError'),
      position: 'top',
    });
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

@media (max-width: 599px) {
  .rp-token-card {
    padding: 24px 20px;
  }
}
</style>
