<template>
  <div class="rp-pos-checkout-tab column no-wrap">
    <div class="rp-pos-checkout-tab__cart col">
      <PosCartPanel
        variant="mobileCheckout"
        omit-summary
        @update:totals="onTotals"
      />
    </div>

    <button
      type="button"
      class="rp-pos-checkout-tab__open-bar"
      @click="checkoutModalOpen = true"
    >
      <div class="rp-pos-checkout-tab__open-bar-inner row items-center no-wrap full-width">
        <q-icon name="receipt_long" size="22px" class="rp-pos-checkout-tab__open-icon" />
        <div class="col">
          <div class="rp-pos-checkout-tab__open-caption">{{ t('pos.proceedToCheckout') }}</div>
          <div class="rp-pos-checkout-tab__open-total">{{ totals.totalFmt }}</div>
        </div>
        <q-icon name="keyboard_arrow_up" size="28px" class="rp-pos-checkout-tab__open-chevron" />
      </div>
    </button>

    <q-dialog
      v-model="checkoutModalOpen"
      position="bottom"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
      class="rp-pos-checkout-modal"
      @hide="dragY = 0"
    >
      <q-card
        class="rp-pos-checkout-modal__card"
        :style="cardTransformStyle"
      >
        <div
          v-touch-pan.down.mouse.prevent="onHandlePan"
          class="rp-pos-checkout-modal__handle"
          :aria-label="t('pos.swipeDownToClose')"
        >
          <div class="rp-pos-checkout-modal__grabber" />
        </div>

        <q-card-section class="rp-pos-checkout-modal__body">
          <PosCustomerBlock class="rp-pos-checkout-tab__customer" />

          <PosDiscountCouponFields
            v-model:discount-mode="discountMode"
            v-model:discount-value="discountValue"
            v-model:coupon-code="couponCode"
            layout="checkout"
          />

          <div class="text-subtitle2 q-mt-lg q-mb-sm">{{ t('pos.checkoutSummary') }}</div>
          <div class="rp-pos-checkout-tab__summary">
            <div class="rp-pos-checkout-tab__summary-row">
              <span>{{ t('pos.lines') }}</span>
              <span>{{ totals.lineCount }}</span>
            </div>
            <div class="rp-pos-checkout-tab__summary-row">
              <span>{{ t('pos.subtotal') }}</span>
              <span>{{ totals.subtotalFmt }}</span>
            </div>
            <div class="rp-pos-checkout-tab__summary-row">
              <span>{{ t('pos.discounts') }}</span>
              <span>{{ totals.discountFmt }}</span>
            </div>
            <div class="rp-pos-checkout-tab__summary-row">
              <span>{{ t('pos.tax') }}</span>
              <span>{{ totals.taxFmt }}</span>
            </div>
            <div class="rp-pos-checkout-tab__summary-row rp-pos-checkout-tab__summary-row--total">
              <span>{{ t('pos.totalDue') }}</span>
              <span>{{ totals.totalFmt }}</span>
            </div>
          </div>

          <PosPaymentBar class="q-mt-md" @pay="onPay" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { TouchPan } from 'quasar';
import type { TouchPanValue } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import PosCartPanel from 'src/components/pos/PosCartPanel.vue';
import PosCustomerBlock from 'src/components/pos/PosCustomerBlock.vue';
import PosDiscountCouponFields from 'src/components/pos/PosDiscountCouponFields.vue';
import PosPaymentBar from 'src/components/pos/PosPaymentBar.vue';

const vTouchPan = TouchPan;

const { t } = useI18n();

const checkoutModalOpen = ref(false);
const dragY = ref(0);
const panning = ref(false);
/** Макс. смещение за жест — на isFinal offset иногда ненадёжен (touchend). */
const panMaxY = ref(0);

const totals = ref({
  totalFmt: '$0.00',
  subtotalFmt: '$0.00',
  discountFmt: '$0.00',
  taxFmt: '$0.00',
  lineCount: 0,
});

function onTotals(payload: typeof totals.value) {
  totals.value = payload;
}

const cardTransformStyle = computed(() => {
  const y = dragY.value;
  if (y <= 0) {
    return {};
  }
  return {
    transform: `translateY(${y}px)`,
    transition: panning.value ? 'none' : 'transform 0.2s ease-out',
  };
});

const onHandlePan: TouchPanValue = (details) => {
  if (!details) return;
  if (details.isFirst) {
    panning.value = true;
    panMaxY.value = 0;
  }
  const y = details.offset?.y ?? 0;
  const down = y > 0 ? y : 0;
  dragY.value = down;
  panMaxY.value = Math.max(panMaxY.value, down);
  if (details.isFinal) {
    panning.value = false;
    const close = panMaxY.value > 100;
    dragY.value = 0;
    panMaxY.value = 0;
    if (close) {
      checkoutModalOpen.value = false;
    }
  }
};

const discountMode = ref<'percent' | 'fixed'>('percent');
const discountValue = ref('');
const couponCode = ref('');

function onPay() {
  /* интеграция с оплатой позже */
}
</script>

<style scoped lang="scss">
.rp-pos-checkout-tab {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  background: var(--rp-background);
  overflow: hidden;
}

.rp-pos-checkout-tab__cart {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.rp-pos-checkout-tab__cart .rp-pos-cart) {
  flex: 1 1 0%;
  min-height: 0;
}

.rp-pos-checkout-tab__open-bar {
  flex-shrink: 0;
  width: 100%;
  margin: 0;
  padding: 12px 16px;
  padding-bottom: max(12px, var(--rp-safe-inset-bottom));
  border: none;
  border-top: 1px solid var(--rp-border);
  background: var(--rp-card);
  cursor: pointer;
  text-align: left;
  color: inherit;
  box-shadow: 0 -4px 24px color-mix(in srgb, #000 12%, transparent);
}

.rp-pos-checkout-tab__open-bar:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: -2px;
}

.rp-pos-checkout-tab__open-caption {
  font-size: 12px;
  color: var(--rp-muted-foreground);
}

.rp-pos-checkout-tab__open-total {
  font-size: 20px;
  font-weight: 700;
  color: var(--rp-foreground);
  line-height: 1.2;
}

.rp-pos-checkout-tab__open-icon {
  margin-right: 12px;
  color: var(--rp-muted-foreground);
}

.rp-pos-checkout-tab__open-chevron {
  color: var(--rp-muted-foreground);
  flex-shrink: 0;
}

:deep(.rp-pos-checkout-modal .q-dialog__inner) {
  padding: 0;
}

.rp-pos-checkout-modal__card {
  width: 100%;
  height: 95vh;
  max-height: 95vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--rp-card);
  will-change: transform;
}

.rp-pos-checkout-modal__handle {
  flex-shrink: 0;
  min-height: 48px;
  padding: 12px 16px 8px;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
}

.rp-pos-checkout-modal__handle:active {
  cursor: grabbing;
}

.rp-pos-checkout-modal__grabber {
  width: 40px;
  height: 4px;
  margin: 0 auto;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 28%, transparent);
}

.rp-pos-checkout-modal__body {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: max(16px, var(--rp-safe-inset-bottom));
}

:deep(.rp-pos-checkout-tab__customer) {
  border-bottom: none !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.rp-pos-checkout-tab__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.rp-pos-checkout-tab__summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--rp-muted-foreground);
}

.rp-pos-checkout-tab__summary-row--total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--rp-border);
  font-size: 18px;
  font-weight: 700;
  color: var(--rp-foreground);
}

:deep(.rp-pos-checkout-modal__body .rp-pos-pay) {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}

:deep(.rp-pos-checkout-modal__body .rp-pos-pay-btn) {
  min-height: 72px;
}
</style>
