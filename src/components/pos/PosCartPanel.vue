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
            v-for="(line, idx) in lines"
            :key="line.id"
            type="button"
            class="rp-pos-cart-line"
            :class="{ 'rp-pos-cart-line--active': idx === activeIndex }"
            @click="activeIndex = idx"
          >
            <div class="rp-pos-cart-line__head row items-center justify-between">
              <div class="rp-pos-cart-line__title row items-center no-wrap">
                <q-icon
                  name="expand_less"
                  size="16px"
                  :class="
                    idx === activeIndex
                      ? 'text-white'
                      : 'rp-icon-fg'
                  "
                />
                <span class="ellipsis">{{ line.title }}</span>
              </div>
              <span
                class="rp-pos-cart-line__price"
                :class="idx === activeIndex ? 'text-white' : ''"
                >{{ line.price }}</span
              >
            </div>
            <div
              class="rp-pos-cart-line__details"
              :class="idx === activeIndex ? 'text-white' : ''"
            >
              {{ line.details }}
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
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

withDefaults(
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

interface CartLine {
  id: string;
  title: string;
  price: string;
  details: string;
}

const activeIndex = ref(0);

/** Позже — из Pinia / API; пусто = экран «корзина пуста». */
const lines = ref<CartLine[]>([]);

function parseMoney(s: string): number {
  const n = parseFloat(String(s).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function fmtUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

const subtotal = computed(() =>
  lines.value.reduce((sum, line) => sum + parseMoney(line.price), 0),
);

/** Заглушки скидки/НДС до интеграции с расчётом чека. */
const discountAbs = computed(() => (lines.value.length === 0 ? 0 : 18));
const taxAmount = computed(() =>
  lines.value.length === 0 ? 0 : Math.round(subtotal.value * 0.0625 * 100) / 100,
);

const subtotalFmt = computed(() => fmtUsd(subtotal.value));
const discountFmt = computed(() =>
  discountAbs.value > 0 ? `-${fmtUsd(discountAbs.value)}` : fmtUsd(0),
);
const taxFmt = computed(() => fmtUsd(taxAmount.value));
const totalFmt = computed(() =>
  fmtUsd(Math.max(0, subtotal.value - discountAbs.value + taxAmount.value)),
);

watch(
  [totalFmt, subtotalFmt, discountFmt, taxFmt, () => lines.value.length],
  () => {
    emit('update:totals', {
      totalFmt: totalFmt.value,
      subtotalFmt: subtotalFmt.value,
      discountFmt: discountFmt.value,
      taxFmt: taxFmt.value,
      lineCount: lines.value.length,
    });
  },
  { immediate: true },
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
}

.rp-pos-cart-scroll-inner {
  padding: 12px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rp-pos-cart-line {
  --rp-cart-line-height: 118px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  height: var(--rp-cart-line-height);
  min-height: var(--rp-cart-line-height);
  flex-shrink: 0;
  text-align: left;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  padding: 8px 10px;
  background: var(--rp-card);
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.rp-pos-cart-line--active {
  background: var(--rp-primary);
  border-color: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.rp-pos-cart-line__head {
  flex-shrink: 0;
}

.rp-pos-cart-line__title {
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  min-width: 0;
}

.rp-pos-cart-line__price {
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.rp-pos-cart-line__details {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 4px;
  font-size: 11px;
  color: var(--rp-muted-foreground);
  line-height: 1.35;
  white-space: pre-line;
  text-align: left;
  overflow: hidden;
}

.rp-pos-cart-line--active .rp-pos-cart-line__details {
  color: color-mix(in srgb, var(--rp-primary-foreground) 86%, transparent);
}

.rp-icon-fg {
  color: var(--rp-foreground);
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
  --rp-cart-line-height: 68px;
  min-height: var(--rp-cart-line-height);
  height: var(--rp-cart-line-height);
  padding: 4px 8px;
  gap: 4px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__head {
  min-height: 0;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__title {
  font-size: 12px;
  gap: 4px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__price {
  font-size: 12px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-line__details {
  font-size: 10px;
  line-height: 1.25;
  margin-top: 2px;
}

.rp-pos-cart--mobile-checkout .rp-pos-cart-summary {
  flex-shrink: 0;
}
</style>
