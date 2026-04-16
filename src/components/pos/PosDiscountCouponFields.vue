<template>
  <div class="rp-pos-discount-coupon-fields">
    <div
      class="text-subtitle2 q-mb-sm"
      :class="{ 'q-mt-lg': layout === 'checkout' }"
    >
      {{ t('pos.discounts') }}
    </div>
    <div
      ref="discountPadZoneRef"
      class="rp-pos-discount-coupon-fields__discount-zone"
    >
      <div
        class="row no-wrap items-stretch rp-pos-discount-coupon-fields__discount-line"
        role="group"
        :aria-label="t('pos.discounts')"
      >
        <q-input
          v-model="discountValue"
          class="col rp-pos-discount-coupon-fields__field rp-pos-discount-coupon-fields__discount-input"
          dense
          outlined
          type="number"
          :suffix="discountMode === 'percent' ? '%' : undefined"
          :prefix="discountMode === 'fixed' ? '$' : undefined"
          :placeholder="t('pos.discountValuePlaceholder')"
          @focus="onDiscountFocus"
          @blur="onDiscountBlur"
        />
        <div class="rp-pos-discount-coupon-fields__icon-toggle">
          <q-btn
            flat
            dense
            :ripple="false"
            icon="percent"
            class="rp-pos-discount-coupon-fields__icon-toggle-btn"
            :class="{
              'rp-pos-discount-coupon-fields__icon-toggle-btn--active':
                discountMode === 'percent',
            }"
            @click="discountMode = 'percent'"
          >
            <q-tooltip>{{ t('pos.discountModePercent') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            :ripple="false"
            icon="monetization_on"
            class="rp-pos-discount-coupon-fields__icon-toggle-btn"
            :class="{
              'rp-pos-discount-coupon-fields__icon-toggle-btn--active':
                discountMode === 'fixed',
            }"
            @click="discountMode = 'fixed'"
          >
            <q-tooltip>{{ t('pos.discountModeFixed') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <RpNumericTouchpad
        v-show="discountPadOpen"
        v-model="discountValue"
        class="rp-pos-discount-coupon-fields__discount-pad q-mt-sm"
        :size="discountTouchpadSize"
        shape="rounded"
        :max-length="discountMaxDigits"
        :aria-label="t('pos.discounts')"
      />
    </div>

    <div class="rp-pos-discount-coupon-fields__coupon-block q-mt-lg">
      <div
        v-if="couponLocked"
        class="rp-pos-discount-coupon-fields__coupon-locked row items-center no-wrap"
      >
        <q-icon
          name="lock"
          size="22px"
          class="rp-pos-discount-coupon-fields__lock-icon"
        />
        <span class="rp-pos-discount-coupon-fields__locked-code ellipsis col">{{
          appliedCouponCode
        }}</span>
        <q-btn
          flat
          round
          dense
          icon="close"
          class="rp-pos-discount-coupon-fields__unlock-btn"
          :aria-label="t('pos.couponUnlockHint')"
          @click="onUnlockCoupon"
        >
          <q-tooltip>{{ t('pos.couponUnlockHint') }}</q-tooltip>
        </q-btn>
      </div>

      <template v-else>
        <q-btn
          v-if="!couponSectionOpen"
          unelevated
          no-caps
          class="full-width rp-ui-btn rp-ui-btn--outline rp-pos-discount-coupon-fields__coupon-expand"
          @click="couponSectionOpen = true"
        >
          <q-icon name="local_offer" size="20px" class="q-mr-sm" />
          {{ t('pos.coupon') }}
        </q-btn>

        <div v-else class="rp-pos-discount-coupon-fields__coupon-expanded">
          <div
            class="row items-center justify-between no-wrap rp-pos-discount-coupon-fields__coupon-header"
          >
            <div class="rp-pos-discount-coupon-fields__coupon-title">
              {{ t('pos.coupon') }}
            </div>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              class="rp-pos-discount-coupon-fields__collapse-btn"
              :label="t('pos.couponCollapse')"
              @click="collapseCouponSection"
            />
          </div>
          <div class="rp-pos-discount-coupon-fields__coupon-fused">
            <q-input
              v-model="couponCode"
              class="rp-pos-discount-coupon-fields__field rp-pos-discount-coupon-fields__coupon-input"
              dense
              outlined
              hide-bottom-space
              :placeholder="t('pos.couponPlaceholder')"
              @focus="onCouponFocus"
              @blur="onCouponBlur"
            />
            <q-btn
              unelevated
              dense
              no-caps
              color="positive"
              text-color="white"
              class="rp-pos-discount-coupon-fields__apply"
              :label="t('pos.applyCoupon')"
              @click="onApplyCoupon"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';
import { useRpKeyboard } from 'src/components/common/keyboard-inject';

const props = withDefaults(
  defineProps<{
    /** В чек-ауте первый блок с отступом сверху; в диалоге — без лишнего отступа. */
    layout?: 'checkout' | 'dialog';
  }>(),
  { layout: 'checkout' },
);

/** Десктопный диалог скидки — крупнее тачпад, мобильный чек — компактный sm. */
const discountTouchpadSize = computed(() =>
  props.layout === 'dialog' ? 'lg' : 'sm',
);

const discountMode = defineModel<'percent' | 'fixed'>('discountMode', {
  default: 'percent',
});
const discountValue = defineModel<string>('discountValue', { default: '' });
const couponCode = defineModel<string>('couponCode', { default: '' });

const { t } = useI18n();
const $q = useQuasar();
const kbd = useRpKeyboard();

const discountPadZoneRef = ref<HTMLElement | null>(null);
const discountPadOpen = ref(false);

/** Процент: до 3 цифр (100), сумма: запас под крупные значения. */
const discountMaxDigits = computed(() =>
  discountMode.value === 'percent' ? 3 : 12,
);

function onDocPointerDown(ev: PointerEvent) {
  if (!discountPadOpen.value || !discountPadZoneRef.value) return;
  const t = ev.target as Node;
  if (!discountPadZoneRef.value.contains(t)) {
    discountPadOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
});

/** Блок купона свёрнут до одной кнопки, пока не раскрыли. */
const couponSectionOpen = ref(false);
/** После «Применить» — только просмотр + снятие по X. */
const couponLocked = ref(false);
const appliedCouponCode = ref('');

function collapseCouponSection() {
  couponSectionOpen.value = false;
}

function onUnlockCoupon() {
  couponLocked.value = false;
  appliedCouponCode.value = '';
  couponSectionOpen.value = true;
}

function onDiscountFocus() {
  discountPadOpen.value = true;
}

function onDiscountBlur(ev: Event) {
  const next = (ev as FocusEvent).relatedTarget as Node | null;
  if (
    next &&
    discountPadZoneRef.value &&
    discountPadZoneRef.value.contains(next)
  ) {
    return;
  }
  discountPadOpen.value = false;
}

function onCouponFocus() {
  kbd.bindInput(
    () => couponCode.value,
    (v) => {
      couponCode.value = v;
    },
  );
  kbd.open();
}

function onCouponBlur() {
  kbd.close();
  kbd.resetBinding();
}

function onApplyCoupon() {
  const code = couponCode.value.trim();
  if (!code) {
    $q.notify({
      type: 'warning',
      message: t('pos.couponEnterCode'),
      position: 'top',
    });
    return;
  }
  appliedCouponCode.value = code;
  couponLocked.value = true;
  $q.notify({
    type: 'positive',
    message: t('pos.couponAppliedStub', { code }),
    position: 'top',
  });
}
</script>

<style scoped lang="scss">
.rp-pos-discount-coupon-fields__discount-line {
  gap: 0;
  margin-top: 0;
}

/* Одна линия: поле без скругления справа, тоггл без скругления слева */
.rp-pos-discount-coupon-fields__discount-input {
  min-width: 0;
}

.rp-pos-discount-coupon-fields__discount-input :deep(.q-field__control) {
  border-radius: var(--rp-radius-md) 0 0 var(--rp-radius-md);
}

.rp-pos-discount-coupon-fields__icon-toggle {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-self: stretch;
  border: 1px solid var(--rp-border);
  border-left-width: 0;
  border-radius: 0 var(--rp-radius-md) var(--rp-radius-md) 0;
  background: var(--rp-input);
  overflow: hidden;
}

.rp-pos-discount-coupon-fields__icon-toggle-btn {
  min-width: 44px;
  height: 100%;
  min-height: 0;
  padding: 0 10px;
  border-radius: 0;
  color: var(--rp-foreground);
  opacity: 0.72;
}

.rp-pos-discount-coupon-fields__icon-toggle-btn :deep(.q-icon) {
  font-size: 22px;
}

.rp-pos-discount-coupon-fields__icon-toggle-btn--active {
  opacity: 1;
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.rp-pos-discount-coupon-fields__icon-toggle-btn:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: -2px;
}

.rp-pos-discount-coupon-fields__field {
  min-width: 0;
}

/* Заголовок блока купона */
.rp-pos-discount-coupon-fields__coupon-header {
  margin-bottom: 10px;
}

.rp-pos-discount-coupon-fields__coupon-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--rp-foreground);
}

/* Склейка поле + «Применить», как у строки скидки: одна высота и радиусы */
.rp-pos-discount-coupon-fields__coupon-fused {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  width: 100%;
  gap: 0;
}

.rp-pos-discount-coupon-fields__coupon-fused .rp-pos-discount-coupon-fields__coupon-input {
  flex: 1 1 0%;
  min-width: 0;
}

.rp-pos-discount-coupon-fields__coupon-fused
  .rp-pos-discount-coupon-fields__coupon-input
  :deep(.q-field__control) {
  border-radius: var(--rp-radius-md) 0 0 var(--rp-radius-md);
}

.rp-pos-discount-coupon-fields__coupon-fused
  .rp-pos-discount-coupon-fields__coupon-input
  :deep(.q-field__control:before) {
  border-right-width: 0;
}

.rp-pos-discount-coupon-fields__coupon-fused
  .rp-pos-discount-coupon-fields__coupon-input
  :deep(.q-field__control:after) {
  border-radius: var(--rp-radius-md) 0 0 var(--rp-radius-md);
}

.rp-pos-discount-coupon-fields__apply {
  flex: 0 0 auto;
  align-self: stretch;
  min-height: 0 !important;
  margin: 0;
  padding: 0 14px;
  border-radius: 0 var(--rp-radius-md) var(--rp-radius-md) 0;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.01em;
  box-shadow: none;
}

.rp-pos-discount-coupon-fields__apply :deep(.q-btn__wrapper) {
  min-height: 100%;
  padding: 0 2px;
}

.rp-pos-discount-coupon-fields__coupon-expand {
  min-height: var(--rp-control-height-dense);
}

.rp-pos-discount-coupon-fields__coupon-expand :deep(.q-icon) {
  color: var(--rp-muted-foreground);
}

.rp-pos-discount-coupon-fields__collapse-btn {
  color: var(--rp-muted-foreground);
  font-size: 13px;
  font-weight: 500;
  padding: 6px 10px;
  margin: -6px -10px -6px 0;
  border-radius: var(--rp-radius-sm);
}

.rp-pos-discount-coupon-fields__collapse-btn:hover {
  color: var(--rp-foreground);
  background: color-mix(in srgb, var(--rp-foreground) 8%, transparent);
}

.rp-pos-discount-coupon-fields__coupon-locked {
  gap: 8px;
  padding: 10px 8px 10px 12px;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-input);
}

.rp-pos-discount-coupon-fields__lock-icon {
  flex-shrink: 0;
  color: var(--rp-muted-foreground);
}

.rp-pos-discount-coupon-fields__locked-code {
  font-weight: 600;
  color: var(--rp-foreground);
  min-width: 0;
}

.rp-pos-discount-coupon-fields__unlock-btn {
  flex-shrink: 0;
  color: var(--rp-muted-foreground);
}
</style>
