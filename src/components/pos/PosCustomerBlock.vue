<template>
  <section class="rp-pos-customer" aria-labelledby="pos-customer-heading">
    <h2 id="pos-customer-heading" class="visually-hidden">{{ t('pos.clientLabel') }}</h2>
    <template v-if="showPicker">
      <PosCustomerPicker class="rp-pos-customer__picker" @create="onCreateCustomer" />
      <PosCustomerCreateDialog v-model="createDialogOpen" @saved="onCustomerSaved" />
    </template>
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
import { Notify } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { PosCustomerCreatePayload } from 'src/components/pos/PosCustomerCreateForm.vue';
import PosCustomerCreateDialog from 'src/components/pos/PosCustomerCreateDialog.vue';
import PosCustomerPicker from 'src/components/pos/PosCustomerPicker.vue';

withDefaults(
  defineProps<{
    /** Мобильное оформление: выбор клиента в модалке чека, не в списке корзины. */
    showPicker?: boolean;
  }>(),
  { showPicker: false },
);

const emit = defineEmits<{
  'customer-saved': [payload: PosCustomerCreatePayload];
}>();

const { t } = useI18n();

const createDialogOpen = ref(false);

function onCreateCustomer(): void {
  createDialogOpen.value = true;
}

function onCustomerSaved(payload: PosCustomerCreatePayload): void {
  Notify.create({
    type: 'positive',
    message: t('pos.customerSavedStub'),
    timeout: 2000,
  });
  emit('customer-saved', payload);
}
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
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--rp-border);
}

.rp-pos-customer__picker {
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .rp-pos-customer {
    padding: 1em;
  }
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
