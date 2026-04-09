<template>
  <section
    class="rp-pos-actions"
    :aria-label="t('pos.actionsTab')"
  >
    <div class="rp-pos-actions-grid">
      <button
        v-for="a in actions"
        :key="a.key"
        type="button"
        class="rp-pos-action-btn"
        :class="
          a.variant === 'primary'
            ? 'rp-pos-action-btn--primary'
            : 'rp-pos-action-btn--muted'
        "
      >
        <q-icon :name="a.icon" size="24px" class="rp-pos-action-icon" />
        <span>{{ a.label }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const actions = computed(() => [
  { key: 'qty', icon: 'pin', label: t('pos.setQuantity'), variant: 'muted' as const },
  {
    key: 'loyalty',
    icon: 'loyalty',
    label: t('pos.addLoyaltyCard'),
    variant: 'muted' as const,
  },
  { key: 'unit', icon: 'straighten', label: t('pos.changeUnit'), variant: 'muted' as const },
  {
    key: 'return',
    icon: 'replay',
    label: t('pos.returnProduct'),
    variant: 'primary' as const,
  },
  {
    key: 'gift',
    icon: 'card_giftcard',
    label: t('pos.giftCardsAction'),
    variant: 'primary' as const,
  },
  {
    key: 'tx',
    icon: 'receipt_long',
    label: t('pos.transactionOption'),
    variant: 'primary' as const,
  },
  { key: 'void', icon: 'block', label: t('pos.voids'), variant: 'primary' as const },
  {
    key: 'shift',
    icon: 'schedule',
    label: t('pos.openCloseShift'),
    variant: 'primary' as const,
  },
]);
</script>

<style scoped lang="scss">
.rp-pos-actions {
  padding: 16px;
}

.rp-pos-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.rp-pos-action-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 12px;
  border: none;
  border-radius: var(--rp-radius-md);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.rp-pos-action-btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-action-btn--muted {
  background: var(--rp-secondary);
  color: var(--rp-foreground);
}

.rp-pos-action-btn--primary {
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.rp-pos-action-icon {
  color: inherit;
  opacity: 0.95;
}

.rp-pos-action-btn:hover {
  filter: brightness(0.97);
}

body.body--dark .rp-pos-action-btn--muted:hover {
  filter: brightness(1.08);
}

body.body--dark .rp-pos-action-btn--primary:hover {
  filter: brightness(1.08);
}
</style>
