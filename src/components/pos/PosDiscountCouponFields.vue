<template>
  <div
    class="rp-pos-discount-coupon-fields"
    :class="{ 'rp-pos-discount-coupon-fields--dialog': layout === 'dialog' }"
  >
    <div class="rp-pos-discount-coupon-fields__discount-stack">
      <div
        class="text-subtitle2 rp-pos-discount-coupon-fields__section-title q-mb-sm"
        :class="{ 'q-mt-lg': layout === 'checkout' }"
      >
        {{ t('pos.discounts') }}
      </div>
      <div
        ref="discountPadZoneRef"
        class="rp-pos-discount-coupon-fields__discount-zone"
      >
        <RpPosDiscountLine
          v-model="discountValue"
          v-model:mode="discountMode"
          :variant="layout === 'dialog' ? 'desktop' : 'compact'"
          @focus="onDiscountFocus"
          @blur="onDiscountBlur"
        />

      <div
        class="rp-pos-discount-coupon-fields__pad-shell"
        :class="{
          'rp-pos-discount-coupon-fields__pad-shell--dialog': layout === 'dialog',
          'q-mt-sm': layout !== 'dialog',
        }"
      >
        <RpNumericTouchpad
          v-show="showDiscountPad"
          v-model="discountValue"
          class="rp-pos-discount-coupon-fields__discount-pad"
          :fill-height="layout === 'dialog'"
          :size="discountTouchpadSize"
          shape="rounded"
          v-bind="dialogTouchpadBind"
          :allow-decimal="discountMode === 'fixed'"
          :max-length="discountMaxDigits"
          :aria-label="t('pos.discounts')"
        />
      </div>
      </div>
    </div>

    <div
      class="rp-pos-discount-coupon-fields__coupon-block"
      :class="{ 'q-mt-lg': layout === 'checkout' }"
    >
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
import RpPosDiscountLine from 'src/components/pos/RpPosDiscountLine.vue';
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

/** В диалоге — плотнее сетка и заполнение высоты; в чекауте пресеты `size`. */
const dialogTouchpadBind = computed(() => {
  if (props.layout !== 'dialog') return {};
  return {
    gap: '6px',
    keyMinHeight: '48px',
    fontSize: 'clamp(20px, 2.5vmin, 28px)',
    keyRadius: '12px',
    backspaceIconSize: '24px',
  };
});

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

const showDiscountPad = computed(
  () => props.layout === 'dialog' || discountPadOpen.value,
);

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

/* Диалог: широкая сетка, две колонки на широком экране, крупнее поля и нумпад */
.rp-pos-discount-coupon-fields--dialog {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .rp-pos-discount-coupon-fields--dialog {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 24px 32px;
    align-items: stretch;
  }
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__section-title {
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__discount-stack {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__pad-shell--dialog {
  flex: 1 1 auto;
  min-height: min(300px, 42vh);
  display: flex;
  flex-direction: column;
  margin-top: 14px;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__discount-pad {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__coupon-block {
  padding: 16px 18px;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: color-mix(in srgb, var(--rp-input) 72%, var(--rp-card));
  min-width: 0;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__coupon-expand {
  min-height: 52px;
  font-size: 15px;
  font-weight: 600;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__coupon-fused :deep(.q-field__control) {
  min-height: 50px;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__coupon-fused :deep(input) {
  font-size: 1rem;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__apply {
  padding: 0 18px;
  font-size: 15px;
}

.rp-pos-discount-coupon-fields--dialog .rp-pos-discount-coupon-fields__coupon-locked {
  padding: 12px 14px;
  border: none;
  background: var(--rp-input);
}
</style>
