<template>
  <div class="rp-pos-customer-picker">
    <video
      v-if="!isNative"
      ref="scanVideoRef"
      class="rp-pos-customer-picker__scan-video"
      :class="{
        'rp-pos-customer-picker__scan-video--hidden': !showPickerScanPreview,
      }"
      muted
      playsinline
    />
    <div
      v-if="scanner.scanning && scanner.needsVideoPreview && showPickerScanPreview"
      class="rp-pos-customer-picker__scan-hud"
    >
      <q-btn
        round
        unelevated
        color="primary"
        icon="close"
        class="rp-pos-customer-picker__scan-stop"
        :aria-label="t('login.stopScan')"
        @click="onStopScan"
      />
    </div>
    <div class="row no-wrap items-stretch q-gutter-xs">
      <q-select
        v-model="selected"
        class="col rp-pos-customer-picker__select"
        outlined
        dense
        use-input
        fill-input
        hide-selected
        emit-value
        map-options
        behavior="menu"
        popup-content-class="rp-pos-customer-picker__menu"
        :options="options"
        option-label="label"
        option-value="value"
        :loading="loading"
        input-debounce="300"
        :placeholder="t('pos.customerSearchPlaceholder')"
        :virtual-scroll-item-size="OPTION_ROW_PX"
        @filter="filterFn"
        @virtual-scroll="onVirtualScroll"
      >
        <template #prepend>
          <q-icon name="search" size="20px" class="rp-pos-customer-picker__icon-muted" />
        </template>
        <template #append>
          <q-btn
            flat
            dense
            round
            icon="qr_code_scanner"
            class="rp-pos-customer-picker__scan"
            :disable="!scanner.supported"
            :aria-label="t('pos.scanBarcode')"
            @click.stop.prevent="onScan"
          />
        </template>
      </q-select>
      <q-btn
        unelevated
        class="rp-pos-customer-picker__add"
        icon="add"
        :aria-label="t('pos.addCustomer')"
        @click="emit('create')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useScanner } from 'src/stores/scanner';

const PAGE = 5;
/** Высота строки в списке (virtual scroll должен совпадать с CSS). */
const OPTION_ROW_PX = 56;

type CustomerOpt = { label: string; value: string };

const emit = defineEmits<{
  create: [];
}>();

const { t } = useI18n();
const scanner = useScanner();
const { webPreviewVideoTarget } = scanner;
const scanVideoRef = ref<HTMLVideoElement | null>(null);
const isNative = Capacitor.isNativePlatform();

const showPickerScanPreview = computed(
  () =>
    webPreviewVideoTarget.value !== null &&
    scanVideoRef.value === webPreviewVideoTarget.value,
);

/** Заглушка до API: те же 28 записей, что в превью. */
const MOCK: CustomerOpt[] = Array.from({ length: 28 }, (_, i) => ({
  label: `Клиент ${i + 1} · +7 900 ${String(1000000 + i).slice(-7)}`,
  value: `cust-${i + 1}`,
}));

const selected = ref<string | null>(null);
const loading = ref(false);
const buffer = ref<CustomerOpt[]>([]);
const options = ref<CustomerOpt[]>([]);

function applyFilter(needle: string) {
  const n = needle.trim().toLowerCase();
  buffer.value = n
    ? MOCK.filter((o) => o.label.toLowerCase().includes(n))
    : MOCK.slice();
  options.value = buffer.value.slice(0, PAGE);
}

function filterFn(val: string, update: (fn: () => void) => void) {
  loading.value = true;
  update(() => {
    applyFilter(val);
    loading.value = false;
  });
}

function onVirtualScroll(details: {
  to: number;
  direction: 'increase' | 'decrease';
}) {
  if (buffer.value.length <= options.value.length) return;
  if (details.direction !== 'increase') return;
  if (details.to < options.value.length - 1) return;
  const next = Math.min(options.value.length + PAGE, buffer.value.length);
  options.value = buffer.value.slice(0, next);
}

async function onScan() {
  const fromHeader = scanner.defaultWebScanVideo;
  const el = (fromHeader ?? scanVideoRef.value) ?? null;
  const result = await scanner.startScan(el);
  const v = result?.value?.trim().toLowerCase();
  if (!v) return;
  const found =
    MOCK.find(
      (o) =>
        o.value.toLowerCase() === v ||
        o.label.toLowerCase().includes(v),
    ) ?? null;
  if (found) selected.value = found.value;
}

function onStopScan() {
  void scanner.stopScan();
}

onMounted(() => {
  void scanner.init();
  applyFilter('');
});

onUnmounted(() => {
  void scanner.stopScan();
});
</script>

<style scoped lang="scss">
.rp-pos-customer-picker {
  position: relative;
  width: 100%;
}

.rp-pos-customer-picker__scan-video {
  position: fixed;
  inset: 0;
  z-index: 6999;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.rp-pos-customer-picker__scan-video--hidden {
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.rp-pos-customer-picker__scan-hud {
  position: fixed;
  inset: 0;
  z-index: 7000;
  pointer-events: none;
  background: color-mix(in srgb, #000 35%, transparent);
}

.rp-pos-customer-picker__scan-stop {
  position: absolute;
  top: max(16px, var(--rp-safe-inset-top));
  right: max(16px, var(--rp-safe-inset-right));
  pointer-events: auto;
}

.rp-pos-customer-picker__icon-muted {
  color: var(--rp-muted-foreground);
}

.rp-pos-customer-picker__scan {
  color: var(--rp-muted-foreground);
}

.rp-pos-customer-picker__add {
  flex-shrink: 0;
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}
</style>

<!-- Меню QSelect в портале — без scoped, класс задаётся через popup-content-class. -->
<style lang="scss">
.rp-pos-customer-picker__menu {

  .q-item--active:not(.q-item--disabled) {
    color: var(--rp-primary-foreground);
    background: var(--rp-primary);
  }
}
</style>
