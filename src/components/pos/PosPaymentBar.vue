<template>
  <div class="rp-pos-pay row q-gutter-md">
    <q-btn
      unelevated
      no-caps
      class="col rp-pos-pay-btn"
      @click="$emit('pay', 'cash')"
    >
      <q-icon name="payments" size="26px" class="q-mb-sm" />
      <span>{{ t('pos.payCash') }}</span>
    </q-btn>
    <q-btn
      unelevated
      no-caps
      class="col rp-pos-pay-btn"
      @click="$emit('pay', 'card')"
    >
      <q-icon name="credit_card" size="26px" class="q-mb-sm" />
      <span>{{ t('pos.payCard') }}</span>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineEmits<{
  pay: [method: 'cash' | 'card'];
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.rp-pos-pay {
  padding: 16px;
}

.rp-pos-pay-btn {
  min-height: 100px;
  border-radius: var(--rp-radius-md);
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
  font-size: 14px;
  font-weight: 600;
  flex-direction: column;
  justify-content: center;
}
</style>
