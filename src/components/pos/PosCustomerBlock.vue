<template>
  <section class="rp-pos-customer" aria-labelledby="pos-customer-heading">
    <h2 id="pos-customer-heading" class="visually-hidden">{{ t('pos.clientLabel') }}</h2>
    <div class="rp-pos-detail-row">
      <span class="rp-pos-detail-label">{{ t('pos.loyaltyCard') }}</span>
      <span class="rp-pos-detail-value">55103</span>
    </div>
    <div class="rp-pos-detail-row">
      <span class="rp-pos-detail-label">{{ t('pos.balance') }}</span>
      <span class="rp-pos-detail-value">$0.00</span>
    </div>
    <div class="rp-pos-detail-row">
      <span class="rp-pos-detail-label">{{ t('pos.creditLimit') }}</span>
      <span class="rp-pos-detail-value">$1,500.00</span>
    </div>
    <div class="rp-pos-detail-row">
      <span class="rp-pos-detail-label">{{ t('pos.homeAddress') }}</span>
      <span class="rp-pos-detail-value">712 1st Ave SW, Kirkland</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rp-pos-customer {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--rp-border);
}

.rp-pos-detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.rp-pos-detail-label {
  color: var(--rp-muted-foreground);
  flex-shrink: 0;
}

.rp-pos-detail-value {
  font-weight: 500;
  text-align: right;
  color: var(--rp-foreground);
  word-break: break-word;
}
</style>
