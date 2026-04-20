<template>
  <div class="rp-pos-discount-line" :class="rootClass">
    <q-input
      v-model="modelValue"
      class="rp-pos-discount-line__input"
      borderless
      dense
      type="text"
      inputmode="decimal"
      :placeholder="placeholderText"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <div
      class="rp-pos-discount-line__toggle-group"
      role="group"
      :aria-label="t('pos.discounts')"
    >
      <button
        type="button"
        class="rp-pos-discount-line__tab"
        :class="{ 'rp-pos-discount-line__tab--active': mode === 'percent' }"
        :aria-pressed="mode === 'percent'"
        :aria-label="t('pos.discountModePercent')"
        @click="onModeClick('percent')"
      >
        %
      </button>
      <button
        type="button"
        class="rp-pos-discount-line__tab"
        :class="{ 'rp-pos-discount-line__tab--active': mode === 'fixed' }"
        :aria-pressed="mode === 'fixed'"
        :aria-label="t('pos.discountModeFixed')"
        @click="onModeClick('fixed')"
      >
        $
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    /** `compact` — как мобильная строка POS; `desktop` — выше поле/табы (десктопная модалка). */
    variant?: 'compact' | 'desktop';
    placeholder?: string;
  }>(),
  { variant: 'compact' },
);

const modelValue = defineModel<string>({ default: '' });
const mode = defineModel<'percent' | 'fixed'>('mode', { default: 'percent' });

const emit = defineEmits<{
  focus: [evt: Event];
  blur: [evt: Event];
}>();

const { t } = useI18n();

const placeholderText = computed(
  () => props.placeholder ?? t('pos.discountValuePlaceholder'),
);

const rootClass = computed(() =>
  props.variant === 'desktop' ? 'rp-pos-discount-line--desktop' : null,
);

function onModeClick(next: 'percent' | 'fixed'): void {
  if (mode.value === next) return;
  mode.value = next;
  modelValue.value = '';
}
</script>

<style scoped lang="scss">
/* Общая линия скидки — как в PosLineItemDialog (lid-discount-*), без outlined + иконки Quasar */
.rp-pos-discount-line {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(120px, 1fr);
  gap: 0;
  border-radius: var(--rp-radius-md);
  overflow: hidden;
  border: 1px solid var(--rp-border);
  background: var(--rp-input);
}

.rp-pos-discount-line__input :deep(.q-field) {
  padding: 0;
}

.rp-pos-discount-line__input :deep(.q-field__control) {
  min-height: 52px;
  height: auto !important;
  align-items: center;
  padding: 0 16px;
  color: var(--rp-foreground);
}

.rp-pos-discount-line__input :deep(.q-field__control-container) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.rp-pos-discount-line__input :deep(.q-field__native) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 0 !important;
  line-height: 1.25;
  display: flex;
  align-items: center;
}

.rp-pos-discount-line__input :deep(input) {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.25;
  padding: 0;
}

.rp-pos-discount-line__input {
  min-width: 0;
}

.rp-pos-discount-line__toggle-group {
  display: flex;
  min-width: 0;
  min-height: 52px;
}

.rp-pos-discount-line__tab {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  background: var(--rp-secondary);
  color: var(--rp-secondary-foreground);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.rp-pos-discount-line__tab + .rp-pos-discount-line__tab {
  border-left: 1px solid var(--rp-border);
}

.rp-pos-discount-line__tab--active {
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

.rp-pos-discount-line__tab:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: -2px;
  z-index: 1;
}

.rp-pos-discount-line--desktop .rp-pos-discount-line__input :deep(.q-field__control) {
  min-height: 60px;
}

.rp-pos-discount-line--desktop.rp-pos-discount-line {
  min-height: 60px;
}

.rp-pos-discount-line--desktop .rp-pos-discount-line__toggle-group {
  min-height: 60px;
}

.rp-pos-discount-line--desktop .rp-pos-discount-line__tab {
  min-height: 60px;
  font-size: 18px;
  font-weight: 500;
}
</style>
