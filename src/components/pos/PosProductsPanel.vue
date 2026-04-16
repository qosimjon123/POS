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
      <div
        v-for="p in products"
        :key="p.id"
        class="rp-pos-product-card"
      >
        <div
          class="rp-pos-product-card__quick"
          role="button"
          tabindex="0"
          :aria-label="`${p.title}. ${t('pos.catalogQuickAdd')}`"
          @click="cartStore.quickAddFromCatalog(p.id)"
          @keydown.enter.prevent="cartStore.quickAddFromCatalog(p.id)"
          @keydown.space.prevent="cartStore.quickAddFromCatalog(p.id)"
        >
          <div class="rp-pos-product-media">
            <q-img
              v-if="p.imageUrl"
              :src="p.imageUrl"
              fit="cover"
              loading="eager"
              class="rp-pos-product-media__qimg"
              spinner-size="28px"
            >
              <template #error>
                <div
                  class="rp-pos-product-media__fallback"
                  aria-hidden="true"
                >
                  <q-icon
                    name="broken_image"
                    size="36px"
                    class="rp-pos-product-media__fallback-icon"
                  />
                </div>
              </template>
            </q-img>
            <div
              v-else
              class="rp-pos-product-media__fallback"
              aria-hidden="true"
            >
              <q-icon
                name="image"
                size="36px"
                class="rp-pos-product-media__fallback-icon"
              />
            </div>
            <template v-if="p.inCartQty > 0">
              <div
                class="rp-pos-product-media__dim"
                aria-hidden="true"
              />
              <div class="rp-pos-product-media__qty">
                {{ p.inCartQty }}
              </div>
            </template>
            <button
              type="button"
              class="rp-pos-product-card__expand"
              :aria-label="t('pos.catalogExpandLine')"
              @click.stop="cartStore.openCatalogLineDialog(p.id)"
            >
              <q-icon name="unfold_more" size="26px" />
            </button>
          </div>
          <div class="rp-pos-product-title">{{ p.title }}</div>
          <div class="rp-pos-product-footer row items-center justify-between">
            <span class="rp-pos-product-price">{{ p.price }}</span>
            <span v-if="p.badge" class="rp-pos-product-badge">{{ p.badge }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatUsd, usePosCartStore } from 'src/stores/pos-cart';

const { t } = useI18n();
const cartStore = usePosCartStore();

const activeId = ref('featured');

const categories = computed(() => [
  { id: 'featured', label: t('pos.featured') },
  { id: 'women', label: t('pos.women') },
  { id: 'shoes', label: t('pos.shoes') },
  { id: 'accessories', label: t('pos.accessories') },
  { id: 'beauty', label: t('pos.beauty') },
  { id: 'gift', label: t('pos.giftCards') },
]);

const products = computed(() => {
  const qty = cartStore.qtyByProductId;
  return cartStore.catalog.map((p) => ({
    id: p.id,
    title: p.title,
    price: formatUsd(p.retailRate),
    imageUrl: p.imageUrl,
    inCartQty: qty[p.id] ?? 0,
    badge: p.badgeKey ? t(`pos.${p.badgeKey}`) : undefined,
  }));
});
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
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--rp-radius-md);
  background: var(--rp-card);
  transition: filter 0.15s ease;
}

.rp-pos-product-card:hover {
  filter: brightness(0.98);
}

body.body--dark .rp-pos-product-card:hover {
  filter: brightness(1.06);
}

.rp-pos-product-card__quick {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  border: none;
  border-radius: var(--rp-radius-md);
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.rp-pos-product-card__quick:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-product-card__expand {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--rp-border);
  border-radius: 50%;
  background: color-mix(in srgb, var(--rp-card) 92%, transparent);
  color: var(--rp-foreground);
  box-shadow: 0 2px 8px color-mix(in srgb, #000 12%, transparent);
  cursor: pointer;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    transform 0.12s ease;
}

.rp-pos-product-card__expand:hover {
  background: color-mix(in srgb, var(--rp-primary) 12%, var(--rp-card));
  border-color: color-mix(in srgb, var(--rp-primary) 35%, var(--rp-border));
}

.rp-pos-product-card__expand:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-product-media {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 120px;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  border-radius: var(--rp-radius-sm);
  overflow: hidden;
  background: var(--rp-muted);
  container-type: inline-size;
  container-name: product-tile;
}

/* q-img внутри flex + <button> иначе даёт нулевую высоту; контейнер держит 4:3, картинка заполняет слой. */
.rp-pos-product-media__qimg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.rp-pos-product-media__qimg :deep(.q-img__container) {
  padding-bottom: 0 !important;
  height: 100% !important;
}

.rp-pos-product-media__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background-color: var(--rp-muted);
  background-image:
    repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--rp-foreground) 10%, transparent) 25%,
      transparent 25%,
      transparent 75%,
      color-mix(in srgb, var(--rp-foreground) 10%, transparent) 75%,
      color-mix(in srgb, var(--rp-foreground) 10%, transparent)
    ),
    repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--rp-foreground) 10%, transparent) 25%,
      var(--rp-muted) 25%,
      var(--rp-muted) 75%,
      color-mix(in srgb, var(--rp-foreground) 10%, transparent) 75%,
      color-mix(in srgb, var(--rp-foreground) 10%, transparent)
    );
  background-position:
    0 0,
    10px 10px;
  background-size: 20px 20px;
}

.rp-pos-product-media__fallback-icon {
  opacity: 0.45;
  color: var(--rp-muted-foreground);
}

.rp-pos-product-media__dim {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: color-mix(in srgb, #000 48%, transparent);
  pointer-events: none;
  border-radius: inherit;
}

.rp-pos-product-media__qty {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  transform: translate(-50%, -50%);
  padding: 0;
  margin: 0;
  font-size: clamp(1.75rem, 32cqi, 3.25rem);
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #fff;
  background: none;
  text-shadow:
    0 1px 3px color-mix(in srgb, #000 85%, transparent),
    0 2px 16px color-mix(in srgb, #000 55%, transparent);
  pointer-events: none;
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
