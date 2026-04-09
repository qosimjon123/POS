<template>
  <div class="rp-pos-products column no-wrap">
    <div class="rp-pos-categories">
      <button
        v-for="c in categories"
        :key="c.id"
        type="button"
        class="rp-pos-category-btn"
        :class="{ 'rp-pos-category-btn--active': c.id === activeId }"
        @click="activeId = c.id"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="rp-pos-product-grid">
      <button
        v-for="p in products"
        :key="p.id"
        type="button"
        class="rp-pos-product-card"
      >
        <div class="rp-pos-product-image" aria-hidden="true" />
        <div class="rp-pos-product-title">{{ p.title }}</div>
        <div class="rp-pos-product-footer row items-center justify-between">
          <span class="rp-pos-product-price">{{ p.price }}</span>
          <span v-if="p.badge" class="rp-pos-product-badge">{{ p.badge }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const activeId = ref('featured');

const categories = computed(() => [
  { id: 'featured', label: t('pos.featured') },
  { id: 'women', label: t('pos.women') },
  { id: 'shoes', label: t('pos.shoes') },
  { id: 'accessories', label: t('pos.accessories') },
  { id: 'beauty', label: t('pos.beauty') },
  { id: 'gift', label: t('pos.giftCards') },
]);

const products = computed(() => [
  {
    id: '1',
    title: 'Slim Fit Dress Shirt',
    price: '$66.49',
    badge: t('pos.popular'),
  },
  {
    id: '2',
    title: 'Floral Print Dress',
    price: '$85.50',
    badge: t('pos.promo'),
  },
  {
    id: '3',
    title: 'White High Heels',
    price: '$190.00',
    badge: t('pos.vip'),
  },
  {
    id: '4',
    title: 'Leather Mini Bag',
    price: '$120.00',
    badge: t('pos.newBadge'),
  },
  {
    id: '5',
    title: 'Silk Scarf',
    price: '$28.00',
    badge: t('pos.hot'),
  },
  {
    id: '6',
    title: 'Daily Sneakers',
    price: '$74.00',
    badge: t('pos.fast'),
  },
  {
    id: '7',
    title: 'Gift Card',
    price: '$25.00',
    badge: t('pos.quick'),
  },
  {
    id: '8',
    title: 'Classic Sunglasses',
    price: '$52.00',
    badge: t('pos.sale'),
  },
]);
</script>

<style scoped lang="scss">
.rp-pos-products {
  flex: 1;
  min-height: 0;
  flex-direction: row;
  gap: 16px;
  padding: 16px;
  background: var(--rp-secondary);
  box-sizing: border-box;
  container-type: inline-size;
  container-name: pos-products;
}

.rp-pos-categories {
  width: 140px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rp-pos-category-btn {
  text-align: left;
  padding: 12px 14px;
  border: none;
  border-radius: var(--rp-radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--rp-muted-foreground);
  background: var(--rp-background);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.rp-pos-category-btn--active {
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.rp-pos-category-btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-product-grid {
  flex: 1;
  min-width: 0;
  display: grid;
  /* Минимум две карточки в ряд (узкая центральная колонка не сваливается в одну колонку). */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-content: start;
  overflow-y: auto;
  padding-bottom: 8px;
}

@container pos-products (min-width: 720px) {
  .rp-pos-product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

.rp-pos-product-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: none;
  border-radius: var(--rp-radius-md);
  background: var(--rp-card);
  text-align: left;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.rp-pos-product-card:hover {
  filter: brightness(0.98);
}

body.body--dark .rp-pos-product-card:hover {
  filter: brightness(1.06);
}

.rp-pos-product-card:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-product-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--rp-radius-sm);
  background-color: var(--rp-muted);
  background-image:
    repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--rp-foreground) 8%, transparent) 25%,
      transparent 25%,
      transparent 75%,
      color-mix(in srgb, var(--rp-foreground) 8%, transparent) 75%,
      color-mix(in srgb, var(--rp-foreground) 8%, transparent)
    ),
    repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--rp-foreground) 8%, transparent) 25%,
      var(--rp-card) 25%,
      var(--rp-card) 75%,
      color-mix(in srgb, var(--rp-foreground) 8%, transparent) 75%,
      color-mix(in srgb, var(--rp-foreground) 8%, transparent)
    );
  background-position:
    0 0,
    10px 10px;
  background-size: 20px 20px;
}

.rp-pos-product-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  min-height: 2.5em;
  color: var(--rp-foreground);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rp-pos-product-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-pos-product-badge {
  padding: 4px 8px;
  border-radius: var(--rp-radius-lg);
  font-size: 12px;
  font-weight: 600;
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
  white-space: nowrap;
}

@media (max-width: 599px) {
  .rp-pos-products {
    flex-direction: column;
    padding: 12px;
  }

  .rp-pos-categories {
    width: 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
    gap: 8px;
  }

  .rp-pos-category-btn {
    flex-shrink: 0;
  }

  .rp-pos-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
