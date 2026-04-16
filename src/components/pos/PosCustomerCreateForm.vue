<template>
  <div class="rp-pos-customer-create-form column">
    <q-input
      v-model="customer_name"
      outlined
      :dense="false"
      :dark="$q.dark.isActive"
      :label="t('pos.customer_name')"
      :aria-label="t('pos.customer_name')"
      class="full-width rp-pos-customer-create-form__field"
    />

    <div class="rp-pos-customer-create-form__tabs-block">
      <q-tabs
        v-model="contactTab"
        no-caps
        align="justify"
        :dark="$q.dark.isActive"
        indicator-color="transparent"
        class="full-width rp-pos-customer-create-form__tabs"
      >
        <q-tab name="mobile" :label="t('pos.customer_mobile_tab')" />
        <q-tab name="email" :label="t('pos.customer_email_tab')" />
      </q-tabs>
      <q-tab-panels
        v-model="contactTab"
        animated
        :dark="$q.dark.isActive"
        class="rp-pos-customer-create-form__panels bg-transparent"
      >
        <q-tab-panel name="mobile" class="q-pa-none">
          <q-input
            v-model="mobile_no"
            outlined
            :dense="false"
            :dark="$q.dark.isActive"
            type="tel"
            :label="t('pos.mobile_no')"
            :aria-label="t('pos.mobile_no')"
            class="full-width rp-pos-customer-create-form__field"
          />
        </q-tab-panel>
        <q-tab-panel name="email" class="q-pa-none">
          <q-input
            v-model="email"
            outlined
            :dense="false"
            :dark="$q.dark.isActive"
            type="email"
            :label="t('pos.customer_email_tab')"
            :aria-label="t('pos.customer_email_tab')"
            class="full-width rp-pos-customer-create-form__field"
          />
        </q-tab-panel>
      </q-tab-panels>
      <div class="rp-pos-customer-create-form__helper">
        {{ t('pos.customer_contact_both_hint') }}
      </div>
    </div>

    <q-input
      v-model="card_number"
      outlined
      :dense="false"
      :dark="$q.dark.isActive"
      :label="t('pos.customer_card_number')"
      :aria-label="t('pos.customer_card_number')"
      class="full-width rp-pos-customer-create-form__field"
    >
      <template #append>
        <q-btn
          flat
          dense
          round
          :dark="$q.dark.isActive"
          icon="qr_code_scanner"
          class="rp-pos-customer-create-form__scan-btn"
          :disable="!scanner.supported"
          :aria-label="t('pos.scanBarcode')"
          @click.stop.prevent="onScanCard"
        />
      </template>
    </q-input>

    <video
      v-if="!isNative"
      ref="scanVideoRef"
      class="fixed-full"
      :class="{ 'fixed-full--off': !showFormScanPreview }"
      muted
      playsinline
    />
    <div
      v-if="scanner.scanning && scanner.needsVideoPreview && showFormScanPreview"
      class="fixed-full scan-hud"
    >
      <q-btn
        round
        unelevated
        :dark="$q.dark.isActive"
        class="scan-hud__stop rp-pos-customer-create-form__save-btn"
        icon="close"
        :aria-label="t('login.stopScan')"
        @click="onStopScan"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useScannerStore } from 'src/stores/scanner';

export type PosCustomerCreatePayload = {
  customer_name: string;
  mobile_no: string;
  email: string;
  card_number: string;
};

const emit = defineEmits<{
  save: [payload: PosCustomerCreatePayload];
  'valid-change': [valid: boolean];
}>();

const { t } = useI18n();
const $q = useQuasar();
const scanner = useScannerStore();
const { webPreviewVideoTarget } = storeToRefs(scanner);

const scanVideoRef = ref<HTMLVideoElement | null>(null);
const isNative = Capacitor.isNativePlatform();

const showFormScanPreview = computed(
  () =>
    webPreviewVideoTarget.value !== null &&
    scanVideoRef.value === webPreviewVideoTarget.value,
);

const customer_name = ref('');
const contactTab = ref<'mobile' | 'email'>('mobile');
const mobile_no = ref('');
const email = ref('');
const card_number = ref('');

const canSubmit = computed(() => {
  const nameOk = customer_name.value.trim().length > 0;
  const cardOk = card_number.value.trim().length > 0;
  const contactOk =
    mobile_no.value.trim().length > 0 || email.value.trim().length > 0;
  return nameOk && cardOk && contactOk;
});

watch(
  canSubmit,
  (v) => {
    emit('valid-change', v);
  },
  { immediate: true },
);

function onScanCard() {
  scanner.armNextScanForCustomerCreateCard();
  const fromHeader = scanner.defaultWebScanVideo;
  const el = (fromHeader ?? scanVideoRef.value) ?? null;
  void scanner.startScan(el);
}

function onStopScan() {
  void scanner.stopScan();
}

watch(
  () => scanner.lastResult,
  (r) => {
    if (!r?.value) return;
    if (!scanner.isNextScanForCustomerCreateCard()) return;
    card_number.value = r.value.trim();
    scanner.disarmNextScanForCustomerCreateCard();
    scanner.clearLastResult();
  },
);

function submit() {
  if (!canSubmit.value) return;
  emit('save', {
    customer_name: customer_name.value.trim(),
    mobile_no: mobile_no.value.trim(),
    email: email.value.trim(),
    card_number: card_number.value.trim(),
  });
}

function reset() {
  customer_name.value = '';
  contactTab.value = 'mobile';
  mobile_no.value = '';
  email.value = '';
  card_number.value = '';
  scanner.disarmNextScanForCustomerCreateCard();
}

defineExpose({ reset, submit, canSubmit });

onMounted(() => {
  void scanner.init();
});

onUnmounted(() => {
  scanner.disarmNextScanForCustomerCreateCard();
  void scanner.stopScan();
});
</script>

<style scoped lang="scss">
/* Banani-like layout:16px gaps, 48px controls, tabs with bottom rule; colors — токены --rp-*. */
.rp-pos-customer-create-form {
  gap: 16px;
  color: var(--rp-foreground);
}

.rp-pos-customer-create-form__tabs-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.rp-pos-customer-create-form__helper {
  font-size: 13px;
  line-height: 1.4;
  color: var(--rp-muted-foreground);
  padding: 0 4px;
}

.rp-pos-customer-create-form :deep(.q-field) {
  color: var(--rp-foreground);
}

.rp-pos-customer-create-form__field :deep(.q-field__inner) {
  color: var(--rp-foreground) !important;
}

.rp-pos-customer-create-form__field :deep(.q-field__control) {
  color: var(--rp-foreground) !important;
  min-height: 52px;
  align-items: center;
}

.rp-pos-customer-create-form__field :deep(.q-field__label) {
  color: var(--rp-muted-foreground);
}

.rp-pos-customer-create-form__field :deep(.q-field--float .q-field__label) {
  color: var(--rp-muted-foreground);
}

.rp-pos-customer-create-form__field :deep(.q-field--focused .q-field__label),
.rp-pos-customer-create-form__field :deep(.q-field--highlighted .q-field__label) {
  color: var(--rp-primary);
}

.rp-pos-customer-create-form__field :deep(.q-field--outlined .q-field__control:before) {
  border-color: var(--rp-border) !important;
  border-radius: var(--rp-radius-sm);
}

.rp-pos-customer-create-form__field :deep(.q-field--outlined .q-field__control:hover:before) {
  border-color: color-mix(in srgb, var(--rp-foreground) 35%, var(--rp-border)) !important;
}

.rp-pos-customer-create-form__field
  :deep(.q-field--outlined.q-field--highlighted .q-field__control:after) {
  border-color: var(--rp-primary) !important;
}

/* Фокус: не даём «чёрной» обводке от currentColor / Quasar primary */
.rp-pos-customer-create-form__field
  :deep(.q-field--outlined.q-field--highlighted .q-field__control:before) {
  border-color: var(--rp-border) !important;
}

.rp-pos-customer-create-form__field :deep(.q-field__native),
.rp-pos-customer-create-form__field :deep(.q-field__input) {
  color: var(--rp-foreground);
  font-size: 15px;
}

.rp-pos-customer-create-form__field :deep(.q-field__native::placeholder),
.rp-pos-customer-create-form__field :deep(.q-field__input::placeholder) {
  color: var(--rp-muted-foreground);
  opacity: 1;
}

.rp-pos-customer-create-form__field :deep(.q-field__marginal .q-icon) {
  color: var(--rp-muted-foreground);
}

.rp-pos-customer-create-form__scan-btn {
  color: var(--rp-foreground) !important;
}

.rp-pos-customer-create-form__scan-btn :deep(.q-icon) {
  color: inherit !important;
}

.rp-pos-customer-create-form__tabs :deep(.q-tabs__content) {
  border-bottom: 1px solid var(--rp-border);
}

.rp-pos-customer-create-form__tabs :deep(.q-tab) {
  flex: 1 1 0%;
  min-height: unset;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--rp-muted-foreground) !important;
  opacity: 1 !important;
}

.rp-pos-customer-create-form__tabs :deep(.q-tab .q-tab__content) {
  color: inherit !important;
  opacity: 1 !important;
}

.rp-pos-customer-create-form__tabs :deep(.q-tab--active) {
  color: var(--rp-foreground) !important;
  opacity: 1 !important;
  border-bottom: 2px solid var(--rp-foreground);
  margin-bottom: -1px;
}

.rp-pos-customer-create-form__tabs :deep(.q-tab--active .q-tab__content) {
  color: var(--rp-foreground) !important;
}

.rp-pos-customer-create-form__tabs :deep(.q-tab__indicator) {
  display: none;
}

.rp-pos-customer-create-form__panels :deep(.q-panel) {
  overflow: visible;
}

.rp-pos-customer-create-form__save-btn {
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}

.fixed-full {
  position: fixed;
  inset: 0;
  z-index: 6999;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.fixed-full--off {
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.scan-hud {
  z-index: 7000;
  pointer-events: none;
  background: color-mix(in srgb, #000 35%, transparent);
}

.scan-hud__stop {
  position: absolute;
  top: max(16px, var(--rp-safe-inset-top));
  right: max(16px, var(--rp-safe-inset-right));
  pointer-events: auto;
}
</style>
