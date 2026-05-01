<template>
  <section class="rp-qr-section" aria-labelledby="qr-login-heading">
    <!-- Desktop / tablet: две колонки как раньше -->
    <div v-if="!isMobile" class="rp-two-col">
      <div class="rp-col-left">
        <QrLoginScanPanel />
      </div>
      <QrLoginPinPanel />
    </div>

    <!-- Телефон: горизонтальный stepper — шаг 1 QR, шаг 2 PIN после сканирования -->
    <q-stepper
      v-else
      v-model="mobileStep"
      flat
      bordered
      alternative-labels
      class="rp-qr-stepper"
      color="primary"
      :dark="$q.dark.isActive"
      :header-nav="false"
      animated
    >
      <q-step
        :name="1"
        :title="t('login.mobileStepQrTitle')"
        icon="qr_code_scanner"
        :done="loginQrCaptured"
      >
        <QrLoginScanPanel />
      </q-step>
      <q-step :name="2" :title="t('login.mobileStepPinTitle')" icon="lock">
        <QrLoginPinPanel />
      </q-step>
    </q-stepper>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import { useLoginStore } from 'src/stores/login';
import QrLoginPinPanel from './QrLoginPinPanel.vue';
import QrLoginScanPanel from './QrLoginScanPanel.vue';

const { t } = useI18n();
const $q = useQuasar();

/** Только телефон (< 600px); планшет и десктоп — прежняя вёрстка */
const isMobile = computed(() => $q.screen.lt.sm);

const login = useLoginStore();
const { mobileStep, loginQrCaptured } = storeToRefs(login);

watch([loginQrCaptured, isMobile], () => {
  if (loginQrCaptured.value && isMobile.value) {
    login.setMobileStep(2);
  }
});
</script>

<style scoped lang="scss">
.rp-qr-section {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.rp-two-col {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  column-gap: 45px;
  align-items: stretch;
}

.rp-col-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

@media (max-width: 1023px) {
  .rp-two-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.rp-qr-stepper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: var(--rp-card);
  border-radius: 16px;
  border-color: var(--rp-border) !important;
  box-shadow: none;
  overflow: hidden;

  :deep(.q-stepper__header) {
    border-radius: 0;
    background: var(--rp-secondary);
    border-bottom: 1px solid var(--rp-border);
  }

  :deep(.q-stepper__header--alternative-labels .q-stepper__tab) {
    min-height: 76px;
    padding: 10px 12px 14px;
    flex: 1;
  }

  :deep(.q-stepper__label) {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    max-width: 140px;
    margin-top: 6px;
  }

  :deep(.q-stepper__dot) {
    font-size: 13px;
  }

  :deep(.q-stepper__tab) {
    color: var(--rp-muted-foreground);
  }

  :deep(.q-stepper__tab--active),
  :deep(.q-stepper__tab--done) {
    color: var(--rp-primary);
  }

  :deep(.q-stepper__tab--active .q-stepper__label),
  :deep(.q-stepper__tab--done .q-stepper__label) {
    color: var(--rp-foreground);
  }

  :deep(.q-stepper__tab--disabled .q-stepper__label) {
    color: var(--rp-muted-foreground);
    opacity: 0.65;
  }

  :deep(.q-stepper__step-inner) {
    padding: 12px 12px 20px;
  }

  :deep(.q-stepper__line:before),
  :deep(.q-stepper__line:after) {
    background: var(--rp-border) !important;
  }

  :deep(.rp-scan-stack) {
    gap: 12px;
  }

  :deep(.rp-scanner-status) {
    padding: 20px 16px;
  }

  :deep(.rp-hint-row) {
    padding: 16px;
    font-size: 14px;
  }

  :deep(.rp-pin-card) {
    padding: 24px 16px;
  }
}
</style>
