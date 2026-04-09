<template>
  <nav
    class="rp-pos-cat-strip"
    :aria-label="t('pos.categories')"
  >
    <button
      v-for="c in categories"
      :key="c.id"
      type="button"
      class="rp-pos-cat-strip__btn"
      :class="{ 'rp-pos-cat-strip__btn--active': c.id === categoryId }"
      :title="c.label"
      @click="categoryId = c.id"
    >
      <span class="rp-pos-cat-strip__label">{{ c.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const categoryId = defineModel<string>({ default: 'featured' });

const categories = computed(() => [
  { id: 'featured', label: t('pos.featured') },
  { id: 'women', label: t('pos.women') },
  { id: 'shoes', label: t('pos.shoes') },
  { id: 'accessories', label: t('pos.accessories') },
  { id: 'beauty', label: t('pos.beauty') },
  { id: 'gift', label: t('pos.giftCards') },
]);
</script>

<style scoped lang="scss">
.rp-pos-cat-strip {
  width: 56px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 6px;
  background: var(--rp-secondary);
  box-sizing: border-box;
  overflow-y: auto;
}

.rp-pos-cat-strip__btn {
  width: 100%;
  min-height: 44px;
  padding: 8px 4px;
  border: none;
  border-radius: var(--rp-radius-md);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--rp-muted-foreground);
  background: var(--rp-background);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.rp-pos-cat-strip__btn--active {
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.rp-pos-cat-strip__btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-cat-strip__label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
