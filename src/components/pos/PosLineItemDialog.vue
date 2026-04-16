<template>
  <q-dialog
    :model-value="cartStore.lineDialogOpen"
    :persistent="!isLineDialogCompact"
    :position="lineDialogPosition"
    :full-width="isLineDialogCompact"
    :transition-show="lineDialogTransitionShow"
    :transition-hide="lineDialogTransitionHide"
    class="lid-line-dialog"
    :class="{ 'lid-line-dialog--bottom-sheet': isLineDialogCompact }"
    @update:model-value="onDialogUpdate"
    @hide="onLineSheetHide"
  >
    <q-card
      flat
      class="lid-dialog-card"
      :class="{ 'lid-dialog-card--sheet': isLineDialogCompact }"
      :style="lineSheetCardStyle"
    >
      <div
        v-if="isLineDialogCompact"
        v-touch-pan.down.mouse.prevent="onLineSheetPan"
        class="lid-sheet-handle"
        :aria-label="t('pos.swipeDownToClose')"
      >
        <div class="lid-sheet-grabber" />
      </div>
      <div class="lid-dialog-main">
        <div v-if="!isLineDialogCompact" class="lid-image-rail">
          <div class="lid-image-panel">
            <div class="lid-product-image-frame">
              <q-img
                class="lid-product-image rounded-borders"
                :src="imageSrc"
                fit="cover"
                spinner-color="primary"
                :ratio="3 / 4"
              >
                <template #error>
                  <div
                    class="lid-product-image lid-product-image--fallback row items-center justify-center"
                    aria-hidden="true"
                  >
                    <q-icon name="image_not_supported" size="56px" color="grey-6" />
                  </div>
                </template>
              </q-img>
            </div>
          </div>

          <div class="lid-desktop-keypad">
            <div class="lid-desktop-keypad-inner">
              <div class="lid-desktop-keypad-label">{{ t('pos.numericKeypadHint') }}</div>
              <div class="lid-desktop-field-tabs" role="tablist" :aria-label="t('pos.numericKeypadHint')">
                <button
                  v-for="tab in desktopNumericTabs"
                  :key="tab.target"
                  type="button"
                  role="tab"
                  class="lid-desktop-field-tab"
                  :class="{ 'lid-desktop-field-tab--active': desktopNumericTarget === tab.target }"
                  :aria-selected="desktopNumericTarget === tab.target"
                  @click="activateDesktopNumericTarget(tab.target)"
                >
                  {{ tab.label }}
                </button>
              </div>
              <RpNumericTouchpad
                v-model="desktopTouchpadModel"
                class="lid-touchpad lid-touchpad--desktop-rail"
                size="sm"
                shape="rounded"
                gap="8px"
                key-max-width="56px"
                key-min-height="48px"
                font-size="20px"
                key-radius="12px"
                backspace-icon-size="22px"
                :allow-decimal="desktopTouchAllowDecimal"
                :max-length="desktopTouchMaxLength"
                :aria-label="desktopTouchAriaLabel"
              />
            </div>
          </div>
        </div>

        <div class="lid-content-panel">
          <div v-if="isLineDialogCompact" class="lid-mobile-hero">
            <div class="lid-mobile-hero__thumb">
              <div class="lid-product-image-frame lid-product-image-frame--mobile-hero">
                <q-img
                  class="lid-product-image lid-product-image--mobile-hero rounded-borders"
                  :src="imageSrc"
                  fit="cover"
                  spinner-color="primary"
                  :ratio="1"
                >
                  <template #error>
                    <div
                      class="lid-product-image lid-product-image--fallback row items-center justify-center"
                      aria-hidden="true"
                    >
                      <q-icon name="image_not_supported" size="36px" color="grey-6" />
                    </div>
                  </template>
                </q-img>
              </div>
            </div>
            <div class="lid-mobile-hero__text col min-w-0">
              <div class="lid-eyebrow lid-mobile-hero__eyebrow">{{ eyebrowText }}</div>
              <h1 class="lid-dialog-title lid-mobile-hero__title">{{ dialogTitle }}</h1>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              class="lid-close-btn lid-mobile-hero__close"
              :aria-label="t('system.cancel')"
              @click="cartStore.closeLineDialog()"
            />
          </div>

          <div class="lid-content-scroll">
            <div v-if="!isLineDialogCompact" class="lid-topbar">
              <div class="lid-title-wrap">
                <div class="lid-eyebrow">{{ eyebrowText }}</div>
                <h1 class="lid-dialog-title">{{ dialogTitle }}</h1>
                <p class="lid-dialog-desc">{{ descText }}</p>
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                class="lid-close-btn"
                :aria-label="t('system.cancel')"
                @click="cartStore.closeLineDialog()"
              />
            </div>
            <p v-else class="lid-dialog-desc lid-dialog-desc--mobile">{{ descText }}</p>

            <template v-if="formReady">
              <div class="lid-section-grid">
                <div class="lid-field">
                  <div class="lid-field-label">{{ t('pos.warehouseShipping') }}</div>
                  <q-select
                    v-if="isCatalog"
                    v-model="warehouseId"
                    class="lid-select"
                    :options="warehouseOptions"
                    option-value="id"
                    option-label="label"
                    emit-value
                    map-options
                    borderless
                    dense
                    dropdown-icon="expand_more"
                    @popup-show="closeAllPads"
                  >
                    <template #selected>
                      <div class="lid-select-text">
                        <span class="lid-select-caption">{{ t('pos.warehouseFieldCaption') }}</span>
                        <span class="lid-select-value">{{ warehouseDisplayLabel }}</span>
                      </div>
                    </template>
                  </q-select>
                  <div v-else class="lid-select-box" aria-readonly="true">
                    <div class="lid-select-text">
                      <span class="lid-select-caption">{{ t('pos.warehouseFieldCaption') }}</span>
                      <span class="lid-select-value">{{ warehouseLabelReadonly }}</span>
                    </div>
                    <q-icon name="expand_more" size="20px" class="lid-chevron" aria-hidden="true" />
                  </div>
                </div>

                <div class="lid-field">
                  <div class="lid-field-label">{{ t('pos.changeUnit') }}</div>
                  <q-select
                    v-model="uom"
                    class="lid-select"
                    :options="uomOptions"
                    emit-value
                    map-options
                    borderless
                    dense
                    dropdown-icon="expand_more"
                    @popup-show="closeAllPads"
                  >
                    <template #selected>
                      <div class="lid-select-text">
                        <span class="lid-select-caption">{{ t('pos.uomFieldCaption') }}</span>
                        <span class="lid-select-value">{{ uom }}</span>
                      </div>
                    </template>
                  </q-select>
                </div>

                <div class="lid-field">
                  <div class="lid-field-label">{{ t('pos.priceList') }}</div>
                  <q-select
                    v-model="priceListKind"
                    class="lid-select"
                    :options="priceKindOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    borderless
                    dense
                    dropdown-icon="expand_more"
                    @update:model-value="onPriceListChange"
                    @popup-show="closeAllPads"
                  >
                    <template #selected>
                      <div class="lid-select-text">
                        <span class="lid-select-caption">{{ t('pos.priceListCaption') }}</span>
                        <span class="lid-select-value">{{ priceListDisplayLabel }}</span>
                      </div>
                    </template>
                  </q-select>
                </div>

                <div class="lid-field">
                  <div class="lid-helper-row">
                    <div class="lid-field-label">{{ t('pos.rate') }}</div>
                    <div class="lid-helper-text">{{ t('pos.pricePerUnitHint') }}</div>
                  </div>
                  <div ref="rateZoneRef" class="lid-input-box lid-input-box--price">
                    <q-input
                      v-model="rateStr"
                      class="lid-price-input"
                      borderless
                      dense
                      type="text"
                      inputmode="decimal"
                      :placeholder="t('pos.discountValuePlaceholder')"
                      @focus="onRateFocus"
                    />
                  </div>
                  <RpNumericTouchpad
                    v-show="isLineDialogCompact && ratePadOpen"
                    v-model="rateStr"
                    class="lid-touchpad lid-touchpad--inline q-mt-sm"
                    size="md"
                    shape="rounded"
                    gap="clamp(12px, 3vw, 20px)"
                    key-max-width="74px"
                    key-min-height="50px"
                    font-size="clamp(22px, 5.5vw, 30px)"
                    key-radius="15px"
                    backspace-icon-size="28px"
                    allow-decimal
                    :max-length="12"
                    :aria-label="t('pos.rate')"
                  />
                </div>
              </div>

              <div class="lid-section">
                <div class="lid-helper-row">
                  <div class="lid-field-label">{{ t('pos.discounts') }}</div>
                  <div class="lid-helper-text">{{ t('pos.discountMethodHint') }}</div>
                </div>
                <div ref="discountZoneRef" class="lid-discount-box">
                  <q-input
                    v-model="discountValue"
                    class="lid-discount-value-field"
                    borderless
                    dense
                    type="text"
                    inputmode="decimal"
                    :placeholder="t('pos.discountValuePlaceholder')"
                    @focus="onDiscountFocus"
                  />
                  <button
                    type="button"
                    class="lid-discount-tab"
                    :class="{ 'lid-discount-tab--active': discountMode === 'percent' }"
                    :aria-pressed="discountMode === 'percent'"
                    :aria-label="t('pos.discountModePercent')"
                    @click="setDiscountMode('percent')"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    class="lid-discount-tab"
                    :class="{ 'lid-discount-tab--active': discountMode === 'fixed' }"
                    :aria-pressed="discountMode === 'fixed'"
                    :aria-label="t('pos.discountModeFixed')"
                    @click="setDiscountMode('fixed')"
                  >
                    $
                  </button>
                </div>
                <RpNumericTouchpad
                  v-show="isLineDialogCompact && discountPadOpen"
                  v-model="discountValue"
                  class="lid-touchpad lid-touchpad--inline q-mt-sm"
                  size="md"
                  shape="rounded"
                  gap="clamp(12px, 3vw, 20px)"
                  key-max-width="74px"
                  key-min-height="50px"
                  font-size="clamp(22px, 5.5vw, 30px)"
                  key-radius="15px"
                  backspace-icon-size="28px"
                  :allow-decimal="discountMode === 'fixed'"
                  :max-length="discountMaxDigits"
                  :aria-label="t('pos.discounts')"
                />
              </div>

              <div class="lid-section">
                <div class="lid-helper-row">
                  <div class="lid-field-label">{{ t('pos.quantity') }}</div>
                  <div class="lid-helper-text">{{ t('pos.qtyQuickHint') }}</div>
                </div>
                <div ref="qtyZoneRef" class="lid-qty-row">
                  <button
                    type="button"
                    class="lid-stepper-btn"
                    :aria-label="t('pos.decreaseQty')"
                    @click="bumpQty(-1)"
                  >
                    −
                  </button>
                  <q-input
                    v-model="qtyStr"
                    class="lid-stepper-center"
                    borderless
                    dense
                    type="text"
                    inputmode="numeric"
                    :placeholder="t('pos.discountValuePlaceholder')"
                    @focus="onQtyFocus"
                  />
                  <button
                    type="button"
                    class="lid-stepper-btn"
                    :aria-label="t('pos.increaseQty')"
                    @click="bumpQty(1)"
                  >
                    +
                  </button>
                </div>
                <RpNumericTouchpad
                  v-show="isLineDialogCompact && qtyPadOpen"
                  v-model="qtyStr"
                  class="lid-touchpad lid-touchpad--inline q-mt-sm"
                  size="md"
                  shape="rounded"
                  gap="clamp(12px, 3vw, 20px)"
                  key-max-width="74px"
                  key-min-height="50px"
                  font-size="clamp(22px, 5.5vw, 30px)"
                  key-radius="15px"
                  backspace-icon-size="28px"
                  :max-length="6"
                  :aria-label="t('pos.quantity')"
                />
              </div>

              <div class="lid-summary-card">
                <div class="lid-summary-item">
                  <div class="lid-summary-label">{{ t('pos.summaryTotal') }}</div>
                  <div class="lid-summary-value">{{ summaryLineTotal }}</div>
                </div>
                <div class="lid-summary-item">
                  <div class="lid-summary-label">{{ t('pos.summaryWarehouse') }}</div>
                  <div class="lid-summary-value">{{ summaryWarehouseValue }}</div>
                </div>
                <div class="lid-summary-item">
                  <div class="lid-summary-label">{{ t('pos.summaryPriceType') }}</div>
                  <div class="lid-summary-value">{{ summaryPriceTypeLong }}</div>
                </div>
              </div>
            </template>
          </div>

          <div class="lid-dialog-footer">
            <div class="lid-footer-note">{{ footerNote }}</div>
            <div class="lid-footer-actions">
              <q-btn
                flat
                no-caps
                class="lid-ghost-btn"
                :label="t('system.cancel')"
                @click="cartStore.closeLineDialog()"
              />
              <q-btn
                unelevated
                no-caps
                class="lid-primary-btn"
                :disable="!formReady || !valid"
                :label="isCatalog ? t('pos.addToCart') : t('pos.saveLine')"
                @click="onSubmit"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { TouchPan, useQuasar } from 'quasar';
import type { TouchPanValue } from 'quasar';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const vTouchPan = TouchPan;

import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';
import {
  formatUsd,
  type PriceListKind,
  usePosCartStore,
} from 'src/stores/pos-cart';

const $q = useQuasar();
const { t } = useI18n();
const cartStore = usePosCartStore();

/** Ширина макета диалога: одна колонка, нижний шит как в чекауте, встроенные тачпады. */
const LINE_DIALOG_COMPACT_MAX = 820;
const isLineDialogCompact = computed(() => $q.screen.width <= LINE_DIALOG_COMPACT_MAX);

const lineDialogPosition = computed(() =>
  isLineDialogCompact.value ? ('bottom' as const) : undefined,
);

const lineDialogTransitionShow = computed(() =>
  isLineDialogCompact.value ? 'slide-up' : undefined,
);

const lineDialogTransitionHide = computed(() =>
  isLineDialogCompact.value ? 'slide-down' : undefined,
);

const lineSheetDragY = ref(0);
const lineSheetPanning = ref(false);
const lineSheetPanMaxY = ref(0);

const lineSheetCardStyle = computed(() => {
  if (!isLineDialogCompact.value) {
    return {};
  }
  const y = lineSheetDragY.value;
  if (y <= 0) {
    return {};
  }
  return {
    transform: `translateY(${y}px)`,
    transition: lineSheetPanning.value ? 'none' : 'transform 0.2s ease-out',
  };
});

const onLineSheetPan: TouchPanValue = (details) => {
  if (!isLineDialogCompact.value || !details) return;
  if (details.isFirst) {
    lineSheetPanning.value = true;
    lineSheetPanMaxY.value = 0;
  }
  const y = details.offset?.y ?? 0;
  const down = y > 0 ? y : 0;
  lineSheetDragY.value = down;
  lineSheetPanMaxY.value = Math.max(lineSheetPanMaxY.value, down);
  if (details.isFinal) {
    lineSheetPanning.value = false;
    const close = lineSheetPanMaxY.value > 100;
    lineSheetDragY.value = 0;
    lineSheetPanMaxY.value = 0;
    if (close) {
      cartStore.closeLineDialog();
    }
  }
};

function onLineSheetHide(): void {
  lineSheetDragY.value = 0;
  lineSheetPanMaxY.value = 0;
}

type DesktopNumericTarget = 'rate' | 'discount' | 'qty';

const desktopNumericTarget = ref<DesktopNumericTarget>('rate');

const warehouseId = ref(cartStore.defaultWarehouseId);
const qtyStr = ref('1');
const rateStr = ref('0');
const discountValue = ref('');
const discountMode = ref<'percent' | 'fixed'>('percent');
const priceListKind = ref<PriceListKind>('retail');
const uom = ref('шт');
const retailSnapshot = ref(0);
const wholesaleSnapshot = ref(0);

const rateZoneRef = ref<HTMLElement | null>(null);
const qtyZoneRef = ref<HTMLElement | null>(null);
const discountZoneRef = ref<HTMLElement | null>(null);

const ratePadOpen = ref(false);
const qtyPadOpen = ref(false);
const discountPadOpen = ref(false);

const warehouseOptions = computed(() => cartStore.warehouses);

const isCatalog = computed(() => cartStore.lineDialogContext?.mode === 'catalog');

const formReady = computed(() => !!cartStore.lineDialogContext);

const priceKindOptions = computed(() => [
  { label: t('pos.priceRetail'), value: 'retail' as const },
  { label: t('pos.priceWholesale'), value: 'wholesale' as const },
]);

const warehouseDisplayLabel = computed(() => {
  const w = warehouseOptions.value.find((o) => o.id === warehouseId.value);
  return w?.label ?? '';
});

const priceListDisplayLabel = computed(() => {
  const o = priceKindOptions.value.find((o) => o.value === priceListKind.value);
  return o?.label ?? '';
});

const discountMaxDigits = computed(() =>
  discountMode.value === 'percent' ? 3 : 12,
);

const desktopNumericTabs = computed(() => [
  { target: 'rate' as const, label: t('pos.rate') },
  { target: 'discount' as const, label: t('pos.discounts') },
  { target: 'qty' as const, label: t('pos.quantity') },
]);

const desktopTouchpadModel = computed({
  get(): string {
    switch (desktopNumericTarget.value) {
      case 'rate':
        return rateStr.value;
      case 'discount':
        return discountValue.value;
      case 'qty':
        return qtyStr.value;
      default:
        return '';
    }
  },
  set(v: string) {
    switch (desktopNumericTarget.value) {
      case 'rate':
        rateStr.value = v;
        break;
      case 'discount':
        discountValue.value = v;
        break;
      case 'qty':
        qtyStr.value = v;
        break;
    }
  },
});

const desktopTouchAllowDecimal = computed(
  () =>
    desktopNumericTarget.value === 'rate' ||
    (desktopNumericTarget.value === 'discount' && discountMode.value === 'fixed'),
);

const desktopTouchMaxLength = computed(() => {
  if (desktopNumericTarget.value === 'rate') return 12;
  if (desktopNumericTarget.value === 'discount') return discountMaxDigits.value;
  return 6;
});

const desktopTouchAriaLabel = computed(() => {
  switch (desktopNumericTarget.value) {
    case 'rate':
      return t('pos.rate');
    case 'discount':
      return t('pos.discounts');
    case 'qty':
      return t('pos.quantity');
    default:
      return '';
  }
});

function focusInputInContainer(el: HTMLElement | null | undefined): void {
  const input = el?.querySelector?.('input');
  if (input instanceof HTMLInputElement) {
    input.focus();
    input.select?.();
  }
}

function activateDesktopNumericTarget(target: DesktopNumericTarget): void {
  desktopNumericTarget.value = target;
  void nextTick(() => {
    if (target === 'rate') focusInputInContainer(rateZoneRef.value);
    else if (target === 'discount') focusInputInContainer(discountZoneRef.value);
    else focusInputInContainer(qtyZoneRef.value);
  });
}

const dialogTitle = computed(() => {
  const ctx = cartStore.lineDialogContext;
  if (!ctx) return '';
  if (ctx.mode === 'catalog') {
    const p = cartStore.catalog.find((x) => x.id === ctx.productId);
    return p?.title ?? '';
  }
  const line = cartStore.lines.find((l) => l.id === ctx.lineId);
  return line?.title ?? '';
});

const imageSrc = computed(() => {
  const ctx = cartStore.lineDialogContext;
  if (!ctx) return '';
  if (ctx.mode === 'catalog') {
    return cartStore.catalog.find((x) => x.id === ctx.productId)?.imageUrl ?? '';
  }
  const line = cartStore.lines.find((l) => l.id === ctx.lineId);
  return line?.imageUrl ?? '';
});

const warehouseLabelReadonly = computed(() => {
  const ctx = cartStore.lineDialogContext;
  if (!ctx || ctx.mode !== 'cart') return '';
  return cartStore.lines.find((l) => l.id === ctx.lineId)?.warehouseLabel ?? '';
});

const uomOptions = computed(() => {
  const ctx = cartStore.lineDialogContext;
  if (!ctx) return [];
  if (ctx.mode === 'catalog') {
    const p = cartStore.catalog.find((x) => x.id === ctx.productId);
    return (p?.uoms ?? ['шт']).map((v) => ({ label: v, value: v }));
  }
  const line = cartStore.lines.find((l) => l.id === ctx.lineId);
  const p = line ? cartStore.catalog.find((x) => x.id === line.productId) : undefined;
  const set = new Set<string>([...(p?.uoms ?? []), line?.uom].filter(Boolean) as string[]);
  return [...set].map((v) => ({ label: v, value: v }));
});

const eyebrowText = computed(() =>
  isCatalog.value ? t('pos.lineItemEyebrowCatalog') : t('pos.lineItemEyebrowCart'),
);

const descText = computed(() =>
  isCatalog.value ? t('pos.lineItemDescCatalog') : t('pos.lineItemDescCart'),
);

const footerNote = computed(() =>
  isCatalog.value ? t('pos.lineItemFooterCatalog') : t('pos.lineItemFooterCart'),
);

const summaryPriceTypeLong = computed(() =>
  priceListKind.value === 'wholesale'
    ? t('pos.priceTypeWholesaleLong')
    : t('pos.priceTypeRetailLong'),
);

const summaryWarehouseValue = computed(() =>
  isCatalog.value ? warehouseDisplayLabel.value : warehouseLabelReadonly.value,
);

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseLocaleNumber(s: string): number {
  const x = String(s).replace(',', '.').trim();
  if (x === '') return 0;
  const n = parseFloat(x);
  return Number.isFinite(n) ? n : 0;
}

function formatRateStr(n: number): string {
  const r = roundMoney(n);
  if (!Number.isFinite(r)) return '0';
  return String(r);
}

function previewLineGross(): number {
  const qty = parseInt(qtyStr.value.replace(/\D/g, ''), 10) || 0;
  const rate = roundMoney(parseLocaleNumber(rateStr.value));
  return roundMoney(qty * rate);
}

function previewDiscountAbs(gross: number): number {
  if (discountMode.value === 'fixed') {
    const d = Math.max(0, parseLocaleNumber(discountValue.value));
    return roundMoney(Math.min(d, gross));
  }
  const p = Math.min(100, Math.max(0, parseLocaleNumber(discountValue.value)));
  return roundMoney(gross * (p / 100));
}

const summaryLineTotal = computed(() => {
  const g = previewLineGross();
  const d = previewDiscountAbs(g);
  return formatUsd(roundMoney(g - d));
});

const valid = computed(() => {
  const rateN = roundMoney(parseLocaleNumber(rateStr.value));
  const qtyN = parseInt(qtyStr.value.replace(/\D/g, ''), 10) || 0;
  if (qtyN < 1 || rateN < 0) return false;
  if (!uom.value) return false;
  if (discountMode.value === 'percent') {
    const d = parseLocaleNumber(discountValue.value);
    return d >= 0 && d <= 100;
  }
  return parseLocaleNumber(discountValue.value) >= 0;
});

function closeAllPads(): void {
  ratePadOpen.value = false;
  qtyPadOpen.value = false;
  discountPadOpen.value = false;
}

function onDocPointerDown(ev: PointerEvent): void {
  if (!isLineDialogCompact.value) return;
  const node = ev.target as Node;
  const inRate = rateZoneRef.value?.contains(node);
  const inQty = qtyZoneRef.value?.contains(node);
  const inDisc = discountZoneRef.value?.contains(node);
  if (!inRate && !inQty && !inDisc) {
    closeAllPads();
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
});

function onRateFocus(): void {
  if (!isLineDialogCompact.value) {
    desktopNumericTarget.value = 'rate';
    return;
  }
  ratePadOpen.value = true;
  qtyPadOpen.value = false;
  discountPadOpen.value = false;
}

function onQtyFocus(): void {
  if (!isLineDialogCompact.value) {
    desktopNumericTarget.value = 'qty';
    return;
  }
  qtyPadOpen.value = true;
  ratePadOpen.value = false;
  discountPadOpen.value = false;
}

function onDiscountFocus(): void {
  if (!isLineDialogCompact.value) {
    desktopNumericTarget.value = 'discount';
    return;
  }
  discountPadOpen.value = true;
  ratePadOpen.value = false;
  qtyPadOpen.value = false;
}

function setDiscountMode(mode: 'percent' | 'fixed'): void {
  if (discountMode.value !== mode) {
    discountMode.value = mode;
    discountValue.value = '';
  }
}

function bumpQty(delta: number): void {
  const cur = parseInt(qtyStr.value.replace(/\D/g, ''), 10) || 1;
  const q = Math.max(1, cur + delta);
  qtyStr.value = String(q);
}

function applyRateFromKind(): void {
  const n =
    priceListKind.value === 'wholesale'
      ? wholesaleSnapshot.value
      : retailSnapshot.value;
  rateStr.value = formatRateStr(n);
}

function onPriceListChange(): void {
  applyRateFromKind();
}

function syncFormFromContext(): void {
  const ctx = cartStore.lineDialogContext;
  if (!ctx) return;

  closeAllPads();
  desktopNumericTarget.value = 'rate';

  if (ctx.mode === 'catalog') {
    const p = cartStore.catalog.find((x) => x.id === ctx.productId);
    if (!p) return;
    warehouseId.value = cartStore.defaultWarehouseId;
    qtyStr.value = '1';
    retailSnapshot.value = p.retailRate;
    wholesaleSnapshot.value = p.wholesaleRate;
    priceListKind.value = 'retail';
    uom.value = p.uoms[0] ?? 'шт';
    applyRateFromKind();
    discountMode.value = 'percent';
    discountValue.value = '';
    return;
  }

  const line = cartStore.lines.find((l) => l.id === ctx.lineId);
  if (!line) return;
  warehouseId.value = line.warehouseId;
  qtyStr.value = String(line.qty);
  retailSnapshot.value = line.retailRate;
  wholesaleSnapshot.value = line.wholesaleRate;
  priceListKind.value = line.priceListKind;
  uom.value = line.uom;
  rateStr.value = formatRateStr(line.rate);
  discountMode.value = line.discountMode;
  if (line.discountMode === 'percent') {
    discountValue.value =
      line.discountPercent > 0 ? String(line.discountPercent) : '';
  } else {
    discountValue.value =
      line.discountFixed > 0 ? String(line.discountFixed) : '';
  }
}

watch(
  () => cartStore.lineDialogOpen,
  (open) => {
    if (open) {
      lineSheetDragY.value = 0;
      lineSheetPanMaxY.value = 0;
      syncFormFromContext();
    } else {
      closeAllPads();
    }
  },
);

watch(
  () => cartStore.lineDialogContext,
  () => {
    if (cartStore.lineDialogOpen) {
      syncFormFromContext();
    }
  },
  { deep: true },
);

function onDialogUpdate(open: boolean): void {
  if (!open) {
    cartStore.closeLineDialog();
  }
}

function parseDiscountForSubmit(): {
  discountMode: 'percent' | 'fixed';
  discountPercent: number;
  discountFixed: number;
} {
  if (discountMode.value === 'percent') {
    const d = Math.min(100, Math.max(0, parseLocaleNumber(discountValue.value)));
    return { discountMode: 'percent', discountPercent: d, discountFixed: 0 };
  }
  const d = Math.max(0, parseLocaleNumber(discountValue.value));
  return { discountMode: 'fixed', discountPercent: 0, discountFixed: roundMoney(d) };
}

function onSubmit(): void {
  const ctx = cartStore.lineDialogContext;
  if (!ctx || !valid.value) return;

  const qty = parseInt(qtyStr.value.replace(/\D/g, ''), 10) || 1;
  const rate = roundMoney(parseLocaleNumber(rateStr.value));
  const disc = parseDiscountForSubmit();

  if (ctx.mode === 'catalog') {
    cartStore.addFromCatalog(
      ctx.productId,
      warehouseId.value,
      qty,
      rate,
      uom.value,
      priceListKind.value,
      disc.discountMode,
      disc.discountPercent,
      disc.discountFixed,
    );
  } else {
    cartStore.updateLine(ctx.lineId, {
      qty,
      rate,
      uom: uom.value,
      priceListKind: priceListKind.value,
      discountMode: disc.discountMode,
      discountPercent: disc.discountPercent,
      discountFixed: disc.discountFixed,
    });
  }
  cartStore.closeLineDialog();
}
</script>

<style scoped lang="scss">
.lid-line-dialog :deep(.q-dialog__backdrop) {
  background: color-mix(in srgb, #2b2b2b 78%, #000);
}

.lid-line-dialog--bottom-sheet :deep(.q-dialog__inner) {
  padding: 0;
}

.lid-sheet-handle {
  flex-shrink: 0;
  min-height: 48px;
  padding: 12px 16px 8px;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
}

.lid-sheet-handle:active {
  cursor: grabbing;
}

.lid-sheet-grabber {
  width: 40px;
  height: 4px;
  margin: 0 auto;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 28%, transparent);
}

.lid-dialog-card {
  width: 100%;
  max-width: 920px;
  min-height: min(560px, 95vh);
  max-height: 95vh;
  border-radius: var(--rp-radius-lg);
  background: var(--rp-card);
  color: var(--rp-foreground);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--rp-shadow-md);
  padding: 0;
}

.lid-dialog-card--sheet {
  max-width: 100%;
  width: 100%;
  height: 95vh;
  max-height: 95vh;
  min-height: 0;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 24px color-mix(in srgb, #000 12%, transparent);
  will-change: transform;
}

.lid-dialog-main {
  display: grid;
  grid-template-columns: 1fr;
  flex: 1;
  min-height: 0;
}

@media (min-width: 821px) {
  .lid-dialog-main {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 400px);
  }

  .lid-content-panel {
    grid-column: 1;
    grid-row: 1;
  }

  .lid-image-rail {
    grid-column: 2;
    grid-row: 1;
  }
}

.lid-image-rail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: var(--rp-muted);
  overflow-x: hidden;
}

.lid-image-panel {
  background: var(--rp-muted);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
}

.lid-product-image-frame {
  width: 100%;
  min-height: 0;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  border-radius: var(--rp-radius-md);
  overflow: hidden;
}

@media (min-width: 821px) {
  .lid-image-panel {
    flex: 0 0 auto;
    padding: 14px 12px 10px;
    overflow: visible;
  }

  .lid-product-image-frame {
    max-width: 260px;
    align-self: center;
    width: 100%;
  }
}

.lid-product-image {
  width: 100%;
  min-height: 240px;
  border-radius: var(--rp-radius-md);
}

@media (min-width: 821px) {
  .lid-product-image {
    min-height: 0;
  }
}

.lid-desktop-keypad {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 14px 16px;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--rp-border) 85%, transparent);
  background: color-mix(in srgb, var(--rp-card) 40%, var(--rp-muted));
}

.lid-desktop-keypad-inner {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.lid-desktop-keypad-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--rp-muted-foreground);
  line-height: 1.35;
  margin: 0;
  text-align: center;
}

.lid-desktop-field-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-items: stretch;
}

.lid-desktop-field-tab {
  margin: 0;
  padding: 8px 6px;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-input);
  color: var(--rp-foreground);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.lid-desktop-field-tab:hover {
  background: color-mix(in srgb, var(--rp-foreground) 5%, var(--rp-input));
}

.lid-desktop-field-tab--active {
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
  border-color: var(--rp-primary);
}

.lid-desktop-field-tab:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.lid-touchpad--desktop-rail {
  flex-shrink: 0;
  width: 100%;
}

.lid-product-image--fallback {
  background: color-mix(in srgb, var(--rp-muted-foreground) 12%, var(--rp-muted));
}

.lid-content-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--rp-card);
  min-height: 0;
}

.lid-mobile-hero {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--rp-border);
  background: var(--rp-card);
}

.lid-mobile-hero__thumb {
  flex-shrink: 0;
  align-self: center;
}

.lid-mobile-hero__text {
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: center;
}

.lid-product-image-frame--mobile-hero {
  width: 64px;
  height: 64px;
  max-width: 64px;
  max-height: 64px;
  flex-shrink: 0;
  border-radius: var(--rp-radius-md);
  overflow: hidden;
}

.lid-product-image--mobile-hero {
  width: 100%;
  min-height: 0 !important;
  max-height: 64px;
}

.lid-product-image--mobile-hero :deep(.q-img__container) {
  max-height: 64px;
  padding-bottom: 0 !important;
  height: 64px;
}

.lid-product-image--mobile-hero :deep(img) {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.lid-mobile-hero .lid-product-image-frame--mobile-hero .lid-product-image--fallback {
  min-height: 64px;
  aspect-ratio: 1;
}

.lid-mobile-hero__eyebrow {
  margin: 0;
  width: fit-content;
  max-width: 100%;
}

.lid-mobile-hero__close {
  flex-shrink: 0;
  align-self: flex-start;
}

.lid-mobile-hero__title {
  margin: 0;
  font-size: clamp(1.05rem, 3.6vw, 1.3rem);
  line-height: 1.2;
  font-weight: 600;
  color: var(--rp-foreground);
  min-width: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.lid-dialog-desc--mobile {
  margin: 0;
  padding-bottom: 4px;
}

.lid-content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 821px) {
  .lid-content-scroll {
    padding: 22px 26px 18px;
    gap: 18px;
  }
}

@media (max-width: 599px) {
  .lid-content-scroll {
    padding: 18px 16px 14px;
    gap: 18px;
  }
}

.lid-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lid-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.lid-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--rp-radius-md);
  background: var(--rp-secondary);
  color: var(--rp-secondary-foreground);
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
  max-width: 100%;
}

.lid-dialog-title {
  margin: 0;
  font-size: clamp(1.25rem, 3.2vw, 1.85rem);
  line-height: 1.12;
  font-weight: 600;
  color: var(--rp-foreground);
}

.lid-dialog-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--rp-muted-foreground);
  max-width: 520px;
}

.lid-close-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: var(--rp-radius-md);
  background: var(--rp-secondary);
  color: var(--rp-secondary-foreground);
  flex-shrink: 0;
}

.lid-section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 599px) {
  .lid-section-grid {
    grid-template-columns: 1fr;
  }
}

.lid-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lid-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.lid-field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--rp-foreground);
}

.lid-helper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.lid-helper-text {
  font-size: 13px;
  color: var(--rp-muted-foreground);
  line-height: 1.45;
}

.lid-select-box {
  min-height: 52px;
  background: var(--rp-input);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  color: var(--rp-foreground);
}

.lid-select-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.lid-select-caption {
  font-size: 12px;
  color: var(--rp-muted-foreground);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lid-select-value {
  font-size: 18px;
  color: var(--rp-foreground);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lid-chevron {
  flex-shrink: 0;
  color: var(--rp-muted-foreground);
}

.lid-select {
  min-width: 0;
}

.lid-select :deep(.q-field__control) {
  min-height: 52px;
  padding: 14px 16px;
  background: var(--rp-input);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  color: var(--rp-foreground);
}

.lid-select :deep(.q-field__native) {
  min-height: 0;
  padding: 0;
}

.lid-select :deep(.q-field__marginal) {
  height: auto;
  color: var(--rp-muted-foreground);
}

.lid-select :deep(.q-field__append) {
  padding-left: 8px;
}

.lid-input-box {
  min-height: 52px;
  background: var(--rp-input);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.lid-input-box--price {
  min-height: 56px;
}

/* Quasar dense: фиксированная height: 40px + отступы у native — текст «прилипает» к верху */
.lid-price-input :deep(.q-field),
.lid-discount-value-field :deep(.q-field),
.lid-stepper-center :deep(.q-field) {
  padding: 0;
}

.lid-price-input {
  width: 100%;
  align-self: stretch;
}

.lid-price-input :deep(.q-field__control),
.lid-discount-value-field :deep(.q-field__control),
.lid-stepper-center :deep(.q-field__control) {
  min-height: 52px;
  height: auto !important;
  align-items: center;
}

.lid-price-input :deep(.q-field__control-container),
.lid-discount-value-field :deep(.q-field__control-container),
.lid-stepper-center :deep(.q-field__control-container) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.lid-price-input :deep(.q-field__native),
.lid-discount-value-field :deep(.q-field__native),
.lid-stepper-center :deep(.q-field__native) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 0 !important;
  line-height: 1.25;
  display: flex;
  align-items: center;
}

.lid-price-input :deep(input) {
  font-size: 24px;
  font-weight: 500;
  color: var(--rp-foreground);
  line-height: 1.25;
  padding: 0;
}

.lid-discount-value-field :deep(input),
.lid-stepper-center :deep(input) {
  line-height: 1.25;
  padding: 0;
}

.lid-discount-box {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px 56px;
  gap: 0;
  border-radius: var(--rp-radius-md);
  overflow: hidden;
  border: 1px solid var(--rp-border);
  background: var(--rp-input);
}

.lid-discount-value-field {
  min-width: 0;
}

.lid-discount-value-field :deep(.q-field__control) {
  padding: 0 16px;
  color: var(--rp-foreground);
}

.lid-discount-value-field :deep(input) {
  font-size: 18px;
  font-weight: 500;
}

.lid-discount-tab {
  min-height: 52px;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  background: var(--rp-secondary);
  color: var(--rp-secondary-foreground);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.lid-discount-tab--active {
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.lid-discount-tab:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: -2px;
  z-index: 1;
}

.lid-qty-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 52px;
  gap: 12px;
  align-items: center;
}

.lid-stepper-btn {
  height: 52px;
  margin: 0;
  padding: 0;
  border-radius: var(--rp-radius-md);
  border: 1px solid var(--rp-border);
  background: var(--rp-input);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  line-height: 1;
  color: var(--rp-foreground);
  cursor: pointer;
  transition: background 0.15s ease;
}

.lid-stepper-btn:hover {
  background: color-mix(in srgb, var(--rp-foreground) 6%, var(--rp-input));
}

.lid-stepper-btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.lid-stepper-center {
  min-height: 52px;
  background: var(--rp-input);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.lid-stepper-center :deep(input) {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}

.lid-summary-card {
  background: var(--rp-secondary);
  border-radius: var(--rp-radius-md);
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 480px) {
  .lid-summary-card {
    grid-template-columns: 1fr;
  }
}

.lid-summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.lid-summary-label {
  font-size: 12px;
  color: var(--rp-muted-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lid-summary-value {
  font-size: 18px;
  color: var(--rp-foreground);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lid-dialog-footer {
  flex-shrink: 0;
  padding: 12px 22px 14px;
  background: var(--rp-card);
  border-top: 1px solid var(--rp-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (min-width: 821px) {
  .lid-dialog-footer {
    padding: 12px 26px 16px;
  }
}

@media (max-width: 599px) {
  .lid-dialog-footer {
    padding: 12px 16px 14px;
  }
}

.lid-dialog-card--sheet .lid-dialog-footer {
  padding-bottom: max(16px, var(--rp-safe-inset-bottom));
}

@media (max-width: 599px) {
  .lid-dialog-card--sheet .lid-dialog-footer {
    padding-bottom: max(14px, var(--rp-safe-inset-bottom));
  }
}

.lid-footer-note {
  font-size: 14px;
  color: var(--rp-muted-foreground);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lid-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.lid-ghost-btn {
  min-height: 48px;
  padding: 0 18px;
  border-radius: var(--rp-radius-md);
  font-size: 15px;
  font-weight: 500;
  color: var(--rp-foreground);
}

.lid-primary-btn {
  min-height: 48px;
  padding: 0 18px;
  border-radius: var(--rp-radius-md);
  font-size: 15px;
  font-weight: 500;
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}

.lid-touchpad {
  width: 100%;
}
</style>
