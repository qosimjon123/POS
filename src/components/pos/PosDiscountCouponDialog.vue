<template>
  <q-dialog
    v-model="open"
    class="rp-pos-discount-coupon-dialog"
  >
    <q-card class="rp-pos-discount-coupon-dialog__card">
      <q-card-section class="rp-pos-discount-coupon-dialog__head row items-center no-wrap">
        <div class="text-h6 ellipsis rp-pos-discount-coupon-dialog__title">
          {{ t('pos.discountAndCouponTitle') }}
        </div>
        <q-space />
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          :aria-label="t('system.cancel')"
        />
      </q-card-section>

      <q-card-section class="rp-pos-discount-coupon-dialog__body">
        <PosDiscountCouponFields
          v-model:discount-mode="discountMode"
          v-model:discount-value="discountValue"
          v-model:coupon-code="couponCode"
          layout="dialog"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import PosDiscountCouponFields from 'src/components/pos/PosDiscountCouponFields.vue';

const open = defineModel<boolean>({ default: false });

const { t } = useI18n();

const discountMode = ref<'percent' | 'fixed'>('percent');
const discountValue = ref('');
const couponCode = ref('');
</script>

<style scoped lang="scss">
.rp-pos-discount-coupon-dialog__card {
  width: min(720px, calc(100vw - 48px));
  max-width: 100%;
  min-height: min(480px, 85vh);
  max-height: min(92vh, 880px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--rp-card);
  border-radius: var(--rp-radius-lg);
  box-shadow:
    0 24px 48px color-mix(in srgb, #000 45%, transparent),
    0 0 0 1px color-mix(in srgb, var(--rp-border) 80%, transparent);
}

.rp-pos-discount-coupon-dialog__head {
  flex-shrink: 0;
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--rp-border);
}

.rp-pos-discount-coupon-dialog__title {
  font-size: clamp(1.125rem, 2.5vw, 1.35rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.rp-pos-discount-coupon-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 24px;
  -webkit-overflow-scrolling: touch;
}
</style>
