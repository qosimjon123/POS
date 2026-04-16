<template>
  <div
    class="rp-pos-cart column no-wrap"
    :class="{ 'rp-pos-cart--mobile-checkout': variant === 'mobileCheckout' }"
  >
    <div
      class="rp-pos-cart-list-wrap"
      :class="{ 'rp-pos-cart-list-wrap--has-lines': lines.length > 0 }"
    >
      <q-scroll-area
        v-if="lines.length > 0"
        class="rp-pos-cart-scroll fit"
        visible
      >
        <div class="rp-pos-cart-scroll-inner">
          <button
            v-for="(line, idx) in displayLines"
            :key="line.id"
            type="button"
            class="rp-pos-cart-line"
            :class="{
              'rp-pos-cart-line--active': idx === activeIndex,
              'rp-pos-cart-line--compact': variant === 'mobileCheckout',
            }"
            @click="onLineClick(idx, line.id)"
          >
            <div class="rp-pos-cart-line__inner">
              <div
                class="rp-pos-cart-line__thumb"
                :class="{ 'rp-pos-cart-line__thumb--sm': variant === 'mobileCheckout' }"
              >
                <q-img
                  v-if="line.imageUrl"
                  :src="line.imageUrl"
                  ratio="1"
                  fit="cover"
                  class="rp-pos-cart-line__thumb-img rounded-borders"
                  spinner-size="28px"
                >
                  <template #error>
                    <div class="rp-pos-cart-line__thumb-fallback row items-center justify-center rounded-borders">
                      <q-icon
                        name="shopping_bag"
                        :size="thumbIconSize"
                        class="rp-pos-cart-line__thumb-icon"
                      />
                    </div>
                  </template>
                </q-img>
                <div
                  v-else
                  class="rp-pos-cart-line__thumb-fallback row items-center justify-center rounded-borders"
                >
                  <q-icon
                    name="shopping_bag"
                    :size="thumbIconSize"
                    class="rp-pos-cart-line__thumb-icon"
                  />
                </div>
              </div>
              <div class="col min-w-0 column rp-pos-cart-line__body">
                <div class="rp-pos-cart-line__head">
                  <span class="rp-pos-cart-line__title ellipsis">{{ line.title }}</span>
                  <span class="rp-pos-cart-line__price">{{ line.price }}</span>
                </div>
                <div class="rp-pos-cart-line__details">
                  <div
                    v-if="line.detailsWarehouse"
                    class="rp-pos-cart-line__warehouse-value ellipsis"
                  >
                    {{ line.detailsWarehouse }}
                  </div>
                  <div
                    v-if="line.detailsMeta"
                    class="rp-pos-cart-line__details-line ellipsis"
                  >
                    {{ line.detailsMeta }}
                  </div>
                </div>
              </div>
              <div
                class="rp-pos-cart-line__actions column items-stretch no-wrap"
                @click.stop
              >
                <div class="rp-pos-cart-line__stepper row items-center no-wrap">
                  <button
                    type="button"
                    class="rp-pos-cart-line__step-btn"
                    :aria-label="t('pos.decreaseQty')"
                    @click="cartStore.incrementLineQty(line.id, -1)"
                  >
                    −
                  </button>
                  <span class="rp-pos-cart-line__qty">{{ line.qty }}</span>
                  <button
                    type="button"
                    class="rp-pos-cart-line__step-btn"
                    :aria-label="t('pos.increaseQty')"
                    @click="cartStore.incrementLineQty(line.id, 1)"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  class="rp-pos-cart-line__remove-btn row items-center justify-center"
                  :aria-label="t('pos.removeLine')"
                  @click="cartStore.removeLine(line.id)"
                >
                  <q-icon name="delete_outline" :size="removeIconSize" />
                </button>
              </div>
            </div>
          </button>
        </div>
      </q-scroll-area>
      <div v-else class="rp-pos-cart-empty column items-center justify-center">
        <q-icon
          name="shopping_cart"
          class="rp-pos-cart-empty__icon"
          size="120px"
          aria-hidden="true"
        />
        <div class="rp-pos-cart-empty__title">{{ t('pos.cartEmpty') }}</div>
        <div class="rp-pos-cart-empty__hint">{{ t('pos.cartEmptyHint') }}</div>
      </div>
    </div>

    <div v-if="!omitSummary" class="rp-pos-cart-summary">
      <div class="rp-pos-cart-actions row q-gutter-sm q-mb-md">
        <q-btn
          unelevated
          no-caps
          class="col rp-pos-cart-action rp-pos-cart-action--secondary"
          :aria-label="t('pos.draftCart')"
        >
          <q-icon name="save" size="20px" />
        </q-btn>
        <q-btn
          unelevated
          no-caps
          class="col rp-pos-cart-action rp-pos-cart-action--danger"
          :aria-label="t('pos.resetCart')"
          :disable="lines.length === 0"
          @click="cartStore.clearCart()"
        >
          <q-icon name="restart_alt" size="20px" />
        </q-btn>
      </div>

      <div class="rp-pos-summary-row">
        <span>{{ t('pos.lines') }}</span>
        <span>{{ lines.length }}</span>
      </div>
      <div class="rp-pos-summary-row">
        <span>{{ t('pos.subtotal') }}</span>
        <span>{{ subtotalFmt }}</span>
      </div>
      <div class="rp-pos-summary-row rp-pos-summary-row--emphasis">
        <span>{{ t('pos.discounts') }}</span>
        <span>{{ discountFmt }}</span>
      </div>
      <div class="rp-pos-summary-row">
        <span>{{ t('pos.tax') }}</span>
        <span>{{ taxFmt }}</span>
      </div>
      <div class="rp-pos-total row items-end justify-between">
        <span class="rp-pos-total__label">{{ t('pos.totalDue') }}</span>
        <span class="rp-pos-total__amount">{{ totalFmt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { cartLinePriceListCaption, usePosCartStore } from 'src/stores/pos-cart';

const props = withDefaults(
  defineProps<{
    /** Мобильный «Чек»: список ~5 строк + скролл; итоги ниже по скроллу страницы. */
    variant?: 'default' | 'mobileCheckout';
    /** Мобильный чек: только список; итоги — в панели «К оформлению». */
    omitSummary?: boolean;
  }>(),
  { variant: 'default', omitSummary: false },
);

const emit = defineEmits<{
  'update:totals': [
    payload: {
      totalFmt: string;
      subtotalFmt: string;
      discountFmt: string;
      taxFmt: string;
      lineCount: number;
    },
  ];
}>();

const { t } = useI18n();

const cartStore = usePosCartStore();
const { lines, totalsFormatted } = storeToRefs(cartStore);

const activeIndex = ref(0);

const thumbIconSize = computed(() => (props.variant === 'mobileCheckout' ? '18px' : '22px'));

const removeIconSize = computed(() => (props.variant === 'mobileCheckout' ? '20px' : '22px'));

const displayLines = computed(() =>
  lines.value.map((line) => ({
    id: line.id,
    title: line.title,
    imageUrl: line.imageUrl,
    qty: line.qty,
    price: cartStore.lineDisplayPrice(line),
    detailsWarehouse: line.warehouseLabel,
    detailsMeta: cartLinePriceListCaption(line),
  })),
);

const subtotalFmt = computed(() => totalsFormatted.value.subtotalFmt);
const discountFmt = computed(() => totalsFormatted.value.discountFmt);
const taxFmt = computed(() => totalsFormatted.value.taxFmt);
const totalFmt = computed(() => totalsFormatted.value.totalFmt);

function onLineClick(idx: number, lineId: string): void {
  activeIndex.value = idx;
  cartStore.openCartLineDialog(lineId);
}

watch(
  () => lines.value.length,
  (len) => {
    if (activeIndex.value >= len) {
      activeIndex.value = Math.max(0, len - 1);
    }
  },
);

watch(
  totalsFormatted,
  (totals) => {
    emit('update:totals', { ...totals });
  },
  { immediate: true, deep: true },
);
</script>

<style scoped lang="scss">
.rp-pos-cart {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  background: var(--rp-background);
  border-right: 1px solid var(--rp-border);
  box-sizing: border-box;
  container-type: inline-size;
  container-name: pos-cart;
}

.rp-pos-cart-list-wrap {
  position: relative;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rp-pos-cart-list-wrap--has-lines::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--rp-background) 0%, transparent) 0%,
    color-mix(in srgb, var(--rp-background) 55%, transparent) 45%,
    var(--rp-background) 100%
  );
}

.rp-pos-cart-empty {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  padding: 24px 16px;
  text-align: center;
}

.rp-pos-cart-empty__icon {
  opacity: 0.35;
  color: var(--rp-muted-foreground);
}

.rp-pos-cart-empty__title {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-pos-cart-empty__hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--rp-muted-foreground);
  line-height: 1.4;
  max-width: 220px;
}

/* Один скролл через QScrollArea — без вложенного overflow на строках (иначе жесты и ползунок глючат). */
.rp-pos-cart-scroll {
  flex: 1 1 0%;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
}

/* Иначе ширина контента = max(intrinsic строк, viewport) и строки «вылезают» в соседнюю колонку POS. */
.rp-pos-cart-scroll :deep(.q-scrollarea__content) {
  max-width: 100%;
  box-sizing: border-box;
}

.rp-pos-cart-scroll-inner {
  padding: 12px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.rp-pos-cart-line {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  min-height: 0;
  min-width: 0;
  width: 100%;
  height: fit-content;
  flex-shrink: 0;
  max-width: 100%;
  text-align: left;
  border: 1px solid var(--rp-pos-cart-line-border, var(--rp-border));
  border-radius: var(--rp-radius-lg);
  padding: 12px 14px;
  background: var(--rp-pos-cart-line-bg, var(--rp-card));
  cursor: pointer;
  overflow-x: hidden;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.rp-pos-cart-line__inner {
  flex: 0 0 auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
}

.rp-pos-cart-line__body {
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.rp-pos-cart-line__thumb {
  width: 64px;
  flex-shrink: 0;
  border-radius: var(--rp-radius-sm);
  overflow: hidden;
  align-self: flex-start;
}

.rp-pos-cart-line__thumb--sm {
  width: 52px;
}

.rp-pos-cart-line__thumb-img {
  border-radius: inherit;
}

.rp-pos-cart-line__thumb-fallback {
  width: 100%;
  aspect-ratio: 1;
  background: color-mix(in srgb, var(--rp-muted) 88%, var(--rp-border));
}

.rp-pos-cart-line__thumb-icon {
  color: var(--rp-muted-foreground);
  opacity: 0.85;
}

.rp-pos-cart-line__actions {
  flex-shrink: 0;
  align-self: flex-start;
  gap: 8px;
  min-width: 0;
}

.rp-pos-cart-line__stepper {
  flex-shrink: 0;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--rp-radius-md);
  background: color-mix(in srgb, var(--rp-input) 88%, var(--rp-border));
  border: 1px solid var(--rp-border);
}

.rp-pos-cart-line__remove-btn {
  flex-shrink: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 36px;
  border: 1px solid color-mix(in srgb, var(--rp-negative) 45%, var(--rp-border));
  border-radius: var(--rp-radius-md);
  background: color-mix(in srgb, var(--rp-negative) 8%, var(--rp-card));
  color: var(--rp-negative);
  cursor: pointer;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    transform 0.12s ease;
}

.rp-pos-cart-line__remove-btn:hover {
  background: color-mix(in srgb, var(--rp-negative) 16%, var(--rp-card));
  border-color: color-mix(in srgb, var(--rp-negative) 55%, var(--rp-border));
}

.rp-pos-cart-line__remove-btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-cart-line__step-btn {
  margin: 0;
  padding: 0;
  min-width: 40px;
  min-height: 40px;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-sm);
  background: var(--rp-card);
  color: var(--rp-foreground);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.12s ease,
    border-color 0.12s ease;
}

.rp-pos-cart-line__step-btn:hover {
  background: color-mix(in srgb, var(--rp-foreground) 7%, var(--rp-card));
  border-color: color-mix(in srgb, var(--rp-foreground) 22%, var(--rp-border));
}

.rp-pos-cart-line__step-btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-pos-cart-line__qty {
  min-width: 24px;
  text-align: center;
  font-size: 19px;
  font-weight: 600;
  line-height: 1;
  color: var(--rp-foreground);
}

.rp-pos-cart-line--active {
  position: relative;
  z-index: 1;
  border-color: color-mix(in srgb, var(--rp-primary-foreground) 18%, var(--rp-primary));
  background: linear-gradient(
    152deg,
    color-mix(in srgb, var(--rp-primary) 100%, transparent) 0%,
    color-mix(in srgb, var(--rp-primary) 82%, #000 18%) 100%
  );
  color: var(--rp-primary-foreground);
  box-shadow:
    0 8px 28px color-mix(in srgb, var(--rp-primary) 38%, transparent),
    0 1px 0 color-mix(in srgb, var(--rp-primary-foreground) 14%, transparent) inset,
    inset 3px 0 0 0 color-mix(in srgb, var(--rp-primary-foreground) 45%, transparent);
}

.rp-pos-cart-line--active .rp-pos-cart-line__thumb {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rp-primary-foreground) 22%, transparent),
    0 4px 12px color-mix(in srgb, #000 35%, transparent);
}

.rp-pos-cart-line--active .rp-pos-cart-line__title,
.rp-pos-cart-line--active .rp-pos-cart-line__price,
.rp-pos-cart-line--active .rp-pos-cart-line__qty,
.rp-pos-cart-line--active .rp-pos-cart-line__step-btn {
  color: var(--rp-primary-foreground);
}

.rp-pos-cart-line--active .rp-pos-cart-line__stepper {
  background: color-mix(in srgb, var(--rp-primary-foreground) 12%, transparent);
  border-color: color-mix(in srgb, var(--rp-primary-foreground) 26%, transparent);
  backdrop-filter: blur(6px);
}

.rp-pos-cart-line--active .rp-pos-cart-line__step-btn {
  background: color-mix(in srgb, var(--rp-primary-foreground) 16%, transparent);
  border-color: color-mix(in srgb, var(--rp-primary-foreground) 30%, transparent);
}

.rp-pos-cart-line--active .rp-pos-cart-line__step-btn:hover {
  background: color-mix(in srgb, var(--rp-primary-foreground) 26%, transparent);
  border-color: color-mix(in srgb, var(--rp-primary-foreground) 44%, transparent);
}

.rp-pos-cart-line--active .rp-pos-cart-line__remove-btn {
  background: color-mix(in srgb, var(--rp-negative) 22%, transparent);
  border-color: color-mix(in srgb, var(--rp-negative) 55%, var(--rp-primary-foreground) 20%);
  color: color-mix(in srgb, #fff 88%, var(--rp-negative));
}

.rp-pos-cart-line--active .rp-pos-cart-line__remove-btn:hover {
  background: color-mix(in srgb, var(--rp-negative) 34%, transparent);
  border-color: color-mix(in srgb, var(--rp-negative) 68%, var(--rp-primary-foreground) 12%);
}

.rp-pos-cart-line--active .rp-pos-cart-line__remove-btn:focus-visible {
  outline-color: var(--rp-primary-foreground);
}

.rp-pos-cart-line--active .rp-pos-cart-line__warehouse-value {
  color: color-mix(in srgb, var(--rp-primary-foreground) 76%, transparent);
}

.rp-pos-cart-line--active .rp-pos-cart-line__details-line {
  color: color-mix(in srgb, var(--rp-primary-foreground) 72%, transparent);
}

.rp-pos-cart-line--active .rp-pos-cart-line__thumb-icon {
  color: color-mix(in srgb, var(--rp-primary-foreground) 58%, transparent);
}

.rp-pos-cart-line__head {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-shrink: 0;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.rp-pos-cart-line__title {
  font-weight: 700;
  font-size: 17px;
  line-height: 1.25;
  min-width: 0;
  width: 100%;
  color: var(--rp-foreground);
  text-align: left;
}

.rp-pos-cart-line__price {
  font-weight: 800;
  font-size: 17px;
  line-height: 1.3;
  min-width: 0;
  width: 100%;
  color: var(--rp-foreground);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  text-align: left;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.rp-pos-cart-line__details {
  flex-shrink: 0;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
}

.rp-pos-cart-line__warehouse-value {
  display: block;
  width: 100%;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.35;
  color: var(--rp-muted-foreground);
}

.rp-pos-cart-line__details-line {
  font-size: 14px;
  line-height: 1.4;
  color: var(--rp-muted-foreground);
}

.rp-pos-cart-summary {
  margin-top: 12px;
  padding: 16px;
  padding-top: 18px;
  border-top: 1px solid var(--rp-border);
  flex-shrink: 0;
}

.rp-pos-cart-action {
  min-height: 44px;
  border-radius: var(--rp-radius-md);
}

.rp-pos-cart-action--secondary {
  background: var(--rp-secondary) !important;
  color: var(--rp-foreground) !important;
}

.rp-pos-cart-action--danger {
  background: var(--rp-negative) !important;
  color: #fff !important;
}

.rp-pos-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--rp-muted-foreground);
  margin-bottom: 6px;
}

.rp-pos-summary-row--emphasis {
  color: var(--rp-foreground);
  font-weight: 500;
}

.rp-pos-total {
  margin-top: 12px;
}

.rp-pos-total__label {
  font-size: 18px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-pos-total__amount {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: var(--rp-foreground);
}

@media (max-width: 599px) {
  .rp-pos-cart {
    border-right: none;
  }
}

/* Узкая колонка корзины (десктоп): меньше типографика, чтобы строка умещалась. */
@container pos-cart (max-width: 360px) {
  .rp-pos-cart-line__title,
  .rp-pos-cart-line__price {
    font-size: 15px;
  }

  .rp-pos-cart-line__details-line {
    font-size: 13px;
  }

  .rp-pos-cart-line__warehouse-value {
    font-size: 11px;
  }

  .rp-pos-cart-line__qty {
    font-size: 17px;
  }

  .rp-pos-cart-line__step-btn {
    min-width: 36px;
    min-height: 36px;
    font-size: 22px;
  }

  .rp-pos-summary-row {
    font-size: 13px;
  }

  .rp-pos-total__label {
    font-size: 16px;
  }

  .rp-pos-total__amount {
    font-size: 24px;
  }
}

@container pos-cart (max-width: 280px) {
  .rp-pos-cart-line__title,
  .rp-pos-cart-line__price {
    font-size: 14px;
  }

  .rp-pos-cart-line__details-line {
    font-size: 12px;
  }

  .rp-pos-cart-line__warehouse-value {
    font-size: 10px;
  }

  .rp-pos-cart-line {
    padding: 10px 10px;
  }

  .rp-pos-cart-scroll-inner {
    padding: 8px;
    padding-bottom: 14px;
    gap: 6px;
  }

  .rp-pos-cart-line__inner {
    gap: 8px;
  }

  .rp-pos-cart-line__qty {
    font-size: 16px;
  }

  .rp-pos-cart-line__step-btn {
    min-width: 34px;
    min-height: 34px;
    font-size: 20px;
  }

  .rp-pos-cart-line__remove-btn {
    min-height: 32px;
  }

  .rp-pos-summary-row {
    font-size: 12px;
  }

  .rp-pos-total__label {
    font-size: 15px;
  }

  .rp-pos-total__amount {
    font-size: 21px;
  }
}

/* Мобильная вкладка «Чек»: список ~до 80dvh, компактные строки ≈5 шт. на экран, остальное — скролл в q-scroll-area */
.rp-pos-cart--mobile-checkout {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-list-wrap {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 80dvh;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-scroll {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-scroll-inner {
  padding: 8px;
  padding-bottom: 12px;
  gap: 6px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line {
  padding: 10px 12px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__inner {
  gap: 10px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__thumb {
  width: 52px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__thumb--sm {
  width: 48px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__title,
.rp-pos-cart--mobile-checkout .rp-pos-cart-line__price {
  font-size: 16px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__warehouse-value {
  font-size: 11px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__details-line {
  font-size: 13px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__actions {
  gap: 6px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__stepper {
  gap: 4px;
  padding: 5px 6px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__qty {
  font-size: 18px;
  min-width: 22px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__step-btn {
  min-width: 38px;
  min-height: 38px;
  font-size: 23px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__remove-btn {
  min-height: 34px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-summary {
  flex-shrink: 0;
}

/* Узкий viewport: ещё компактнее (правила ниже mobile-checkout, перекрывают 16px). */
@media (max-width: 420px) {
  .rp-pos-cart-line__title,
  .rp-pos-cart-line__price {
    font-size: 14px;
  }

  .rp-pos-cart-line__details-line {
    font-size: 12px;
  }

  .rp-pos-cart-line__warehouse-value {
    font-size: 10px;
  }

  .rp-pos-cart-line__qty {
    font-size: 16px;
  }

  .rp-pos-cart-line__step-btn {
    min-width: 34px;
    min-height: 34px;
    font-size: 20px;
  }

  .rp-pos-cart-line__remove-btn {
    min-height: 32px;
  }

  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__title,
  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__price {
    font-size: 14px;
  }

  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__details-line {
    font-size: 12px;
  }

  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__warehouse-value {
    font-size: 10px;
  }

  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__qty {
    font-size: 16px;
  }

  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__step-btn {
    min-width: 34px;
    min-height: 34px;
    font-size: 20px;
  }

  .rp-pos-cart--mobile-checkout .rp-pos-cart-line__remove-btn {
    min-height: 32px;
  }
}
</style>
