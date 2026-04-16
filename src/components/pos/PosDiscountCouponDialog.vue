<template>
  <q-dialog
    v-model="open"
    class="rp-pos-discount-coupon-dialog"
  >
    <q-card class="rp-pos-discount-coupon-dialog__card">
      <q-card-section class="row items-center no-wrap q-pb-none">
        <div class="text-h6 ellipsis">{{ t('pos.discountAndCouponTitle') }}</div>
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

      <q-card-section class="q-pt-sm">
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
  width: min(420px, calc(100vw - 32px));
  max-width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  background: var(--rp-card);
}
</style>
