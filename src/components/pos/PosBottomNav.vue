<template>
  <nav
    class="rp-pos-bottom-nav row items-stretch"
    role="tablist"
    :aria-label="t('pos.title')"
  >
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      role="tab"
      class="rp-pos-bottom-nav__btn col column flex-center"
      :class="{ 'rp-pos-bottom-nav__btn--active': model === item.value }"
      :aria-selected="model === item.value"
      @click="model = item.value"
    >
      <q-icon :name="item.icon" size="24px" />
      <span class="rp-pos-bottom-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { PosMobileTab } from './pos-mobile-tab';

const model = defineModel<PosMobileTab>({ required: true });

const { t } = useI18n();

const items = [
  { value: 'products' as const, icon: 'storefront', label: t('pos.productsTab') },
  { value: 'checkout' as const, icon: 'shopping_cart', label: t('pos.checkoutTab') },
  { value: 'actions' as const, icon: 'widgets', label: t('pos.actionsTab') },
  { value: 'profile' as const, icon: 'person', label: t('pos.profileTab') },
];
</script>

<style scoped lang="scss">
.rp-pos-bottom-nav {
  flex-shrink: 0;
  background: var(--rp-card);
  border-top: 1px solid var(--rp-border);
  padding-bottom: max(8px, var(--rp-safe-inset-bottom));
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
  box-shadow: 0 -4px 20px color-mix(in srgb, #000 6%, transparent);
}

.rp-pos-bottom-nav__btn {
  gap: 4px;
  min-height: 56px;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: var(--rp-muted-foreground);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.rp-pos-bottom-nav__btn--active {
  color: var(--rp-foreground);
  background: color-mix(in srgb, var(--rp-foreground) 6%, transparent);
}

.rp-pos-bottom-nav__btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: -2px;
}

.rp-pos-bottom-nav__label {
  text-align: center;
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
