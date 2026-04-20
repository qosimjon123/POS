<template>
  <div
    class="rp-num-touchpad"
    :class="[
      `rp-num-touchpad--size-${size}`,
      `rp-num-touchpad--shape-${shape}`,
      { 'rp-num-touchpad--disabled': disabled },
      { 'rp-num-touchpad--fill-height': fillHeight },
    ]"
    :style="rootStyle"
    role="group"
    :aria-label="ariaLabel"
  >
    <div class="rp-num-touchpad__main">
      <button
        v-for="cell in mainCells"
        :key="cell.id"
        type="button"
        class="rp-num-touchpad__key"
        :class="keyClass(cell)"
        :disabled="isKeyDisabled(cell)"
        :tabindex="0"
        @click="onCellClick(cell)"
      >
        <template v-if="cell.role === 'digit'">{{ cell.value }}</template>
      </button>
    </div>
    <div
      class="rp-num-touchpad__bottom"
      :class="{ 'rp-num-touchpad__bottom--with-clear': showClear }"
    >
      <button
        v-if="showClear"
        type="button"
        class="rp-num-touchpad__key rp-num-touchpad__key--action rp-num-touchpad__key--clear"
        :disabled="isClearDisabled"
        :aria-label="clearAriaLabel ?? clearKeyLabel"
        @click="onClearClick"
      >
        {{ clearKeyLabel }}
      </button>
      <button
        type="button"
        class="rp-num-touchpad__key"
        :class="keyClass(bottomDecimalCell)"
        :disabled="isKeyDisabled(bottomDecimalCell)"
        :tabindex="bottomDecimalCell.role === 'spacer' ? -1 : 0"
        @click="onCellClick(bottomDecimalCell)"
      >
        <template v-if="bottomDecimalCell.role === 'decimal'">{{
          decimalChar
        }}</template>
      </button>
      <button
        type="button"
        class="rp-num-touchpad__key"
        :class="keyClass(zeroCell)"
        :disabled="isKeyDisabled(zeroCell)"
        @click="onCellClick(zeroCell)"
      >
        0
      </button>
      <button
        v-if="showBackspace"
        type="button"
        class="rp-num-touchpad__key rp-num-touchpad__key--action"
        :class="keyClass(backspaceCell)"
        :disabled="isKeyDisabled(backspaceCell)"
        @click="onCellClick(backspaceCell)"
      >
        <q-icon
          name="backspace"
          class="rp-num-touchpad__icon"
          :size="backspaceIconSize"
        />
      </button>
      <button
        v-else
        type="button"
        class="rp-num-touchpad__key rp-num-touchpad__key--spacer"
        disabled
        tabindex="-1"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Cell =
  | { id: string; role: 'digit'; value: string }
  | { id: string; role: 'decimal' }
  | { id: string; role: 'spacer' }
  | { id: string; role: 'backspace' };

const props = withDefaults(
  defineProps<{
    /** Привязка строки (цифры по порядку ввода). Без неё только событие `press`. */
    modelValue?: string;
    disabled?: boolean;
    /** Работает вместе с `modelValue`: не добавлять цифры после лимита. */
    maxLength?: number;
    showBackspace?: boolean;
    /** Клавиша полной очистки (например «С»). */
    showClear?: boolean;
    /** Подпись на клавише очистки. */
    clearKeyLabel?: string;
    /** Доступное имя клавиши очистки (по умолчанию — как `clearKeyLabel`). */
    clearAriaLabel?: string;
    /** Нижний ряд: вместо пустой ячейки — разделитель дроби (один раз). */
    allowDecimal?: boolean;
    /** Символ на клавише и в значении (точка для копеек). */
    decimalChar?: string;
    /** Пресеты зазоров и размеров клавиш. Переопределяется через `gap` / `fontSize` и т.д. */
    size?: 'sm' | 'md' | 'lg';
    /** `circle` — как PIN-экран; `rounded` — прямоугольные клавиши (касса, формы). */
    shape?: 'circle' | 'rounded';
    gap?: string;
    keyMaxWidth?: string;
    keyMinHeight?: string;
    fontSize?: string;
    /** Для `shape="rounded"` — скругление клавиш; для `circle` не используется. */
    keyRadius?: string;
    backspaceIconSize?: string;
    ariaLabel?: string;
    /** Растянуть клавиши на всю высоту родителя (равномерные ряды, без пустоты снизу). */
    fillHeight?: boolean;
  }>(),
  {
    disabled: false,
    showBackspace: true,
    showClear: true,
    clearKeyLabel: 'С',
    allowDecimal: false,
    decimalChar: '.',
    size: 'md',
    shape: 'circle',
    ariaLabel: 'Numeric keypad',
    fillHeight: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  press: [
    payload: {
      type: 'digit' | 'backspace' | 'decimal' | 'clear';
      key: string;
    },
  ];
}>();

const PRESETS: Record<
  'sm' | 'md' | 'lg',
  {
    gap: string;
    keyMaxWidth: string;
    keyMinHeight: string;
    fontSize: string;
    keyRadius: string;
    backspaceIconSize: string;
  }
> = {
  sm: {
    gap: '8px',
    keyMaxWidth: '52px',
    keyMinHeight: '44px',
    fontSize: '18px',
    keyRadius: '12px',
    backspaceIconSize: '22px',
  },
  md: {
    gap: 'clamp(10px, 3vw, 18px)',
    keyMaxWidth: '72px',
    keyMinHeight: '48px',
    fontSize: 'clamp(20px, 5.5vw, 28px)',
    keyRadius: '14px',
    backspaceIconSize: '26px',
  },
  lg: {
    gap: 'clamp(10px, 3vw, 21px)',
    keyMaxWidth: '85px',
    keyMinHeight: '52px',
    fontSize: 'clamp(22px, 7vw, 34px)',
    keyRadius: '16px',
    backspaceIconSize: '28px',
  },
};

const preset = computed(() => PRESETS[props.size]);

const rootStyle = computed(() => {
  const p = preset.value;
  return {
    '--rp-touchpad-gap': props.gap ?? p.gap,
    '--rp-touchpad-key-max-w': props.keyMaxWidth ?? p.keyMaxWidth,
    '--rp-touchpad-key-min-h': props.keyMinHeight ?? p.keyMinHeight,
    '--rp-touchpad-font': props.fontSize ?? p.fontSize,
    '--rp-touchpad-key-radius': props.keyRadius ?? p.keyRadius,
  } as Record<string, string>;
});

const backspaceIconSize = computed(
  () => props.backspaceIconSize ?? preset.value.backspaceIconSize,
);

const mainCells = computed<Cell[]>(() => {
  const c: Cell[] = [];
  for (let i = 1; i <= 9; i++) {
    c.push({ id: `dig-${i}`, role: 'digit', value: String(i) });
  }
  return c;
});

const bottomDecimalCell = computed<Cell>(() =>
  props.allowDecimal
    ? { id: 'decimal', role: 'decimal' }
    : { id: 'sp-bl', role: 'spacer' },
);

const zeroCell = computed<Cell>(() => ({
  id: 'dig-0',
  role: 'digit',
  value: '0',
}));

const backspaceCell = computed<Cell>(() => ({
  id: 'back',
  role: 'backspace',
}));

const isClearDisabled = computed(() => {
  if (props.disabled) return true;
  const v = props.modelValue ?? '';
  return v.length === 0;
});

function keyClass(cell: Cell) {
  return {
    'rp-num-touchpad__key--spacer': cell.role === 'spacer',
    'rp-num-touchpad__key--action': cell.role === 'backspace',
    'rp-num-touchpad__key--digit':
      cell.role === 'digit' || cell.role === 'decimal',
  };
}

function isKeyDisabled(cell: Cell): boolean {
  if (props.disabled) return true;
  if (cell.role === 'spacer') return true;
  if (cell.role === 'decimal') {
    const v = props.modelValue ?? '';
    if (v.includes(props.decimalChar)) return true;
    if (
      props.maxLength !== undefined &&
      v.length >= props.maxLength
    ) {
      return true;
    }
    return false;
  }
  if (cell.role === 'digit') {
    if (
      props.maxLength !== undefined &&
      props.modelValue !== undefined &&
      props.modelValue.length >= props.maxLength
    ) {
      return true;
    }
  }
  if (
    cell.role === 'backspace' &&
    (props.modelValue === undefined || props.modelValue.length === 0)
  ) {
    return true;
  }
  return false;
}

function onClearClick(): void {
  if (isClearDisabled.value) return;
  emit('update:modelValue', '');
  emit('press', { type: 'clear', key: props.clearKeyLabel });
}

function onCellClick(cell: Cell) {
  if (isKeyDisabled(cell) || cell.role === 'spacer') return;

  if (cell.role === 'decimal') {
    if (props.modelValue !== undefined) {
      if (
        props.maxLength !== undefined &&
        props.modelValue.length >= props.maxLength
      ) {
        return;
      }
      emit('update:modelValue', props.modelValue + props.decimalChar);
    }
    emit('press', { type: 'decimal', key: props.decimalChar });
    return;
  }

  if (cell.role === 'backspace') {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', props.modelValue.slice(0, -1));
    }
    emit('press', { type: 'backspace', key: 'Backspace' });
    return;
  }

  if (cell.role === 'digit') {
    if (props.modelValue !== undefined) {
      if (
        props.maxLength !== undefined &&
        props.modelValue.length >= props.maxLength
      ) {
        return;
      }
      emit('update:modelValue', props.modelValue + cell.value);
    }
    emit('press', { type: 'digit', key: cell.value });
  }
}
</script>

<style scoped lang="scss">
.rp-num-touchpad {
  --rp-touchpad-gap: clamp(10px, 3vw, 18px);
  --rp-touchpad-key-max-w: 72px;
  --rp-touchpad-key-min-h: 48px;
  --rp-touchpad-font: clamp(20px, 5.5vw, 28px);
  --rp-touchpad-key-radius: 14px;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  gap: var(--rp-touchpad-gap);
  box-sizing: border-box;
}

.rp-num-touchpad__main {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rp-touchpad-gap);
  justify-items: center;
  justify-content: center;
}

.rp-num-touchpad__bottom {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rp-touchpad-gap);
  justify-items: center;
  justify-content: center;
}

.rp-num-touchpad__bottom--with-clear {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.rp-num-touchpad--disabled {
  opacity: 0.42;
  pointer-events: none;
}

.rp-num-touchpad__key {
  box-sizing: border-box;
  width: 100%;
  border: none;
  background: var(--rp-secondary);
  color: var(--rp-foreground);
  font-size: var(--rp-touchpad-font);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    filter 0.12s ease,
    transform 0.08s ease;
}

.rp-num-touchpad__key--clear {
  font-size: calc(var(--rp-touchpad-font) * 0.92);
}

.rp-num-touchpad__key:disabled:not(.rp-num-touchpad__key--spacer) {
  cursor: default;
  opacity: 0.45;
}

.rp-num-touchpad__key:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: 2px;
}

.rp-num-touchpad__key:active:not(:disabled) {
  transform: scale(0.97);
}

.rp-num-touchpad__key--digit:hover:not(:disabled),
.rp-num-touchpad__key--action:hover:not(:disabled) {
  filter: brightness(1.06);
}

body.body--dark .rp-num-touchpad__key--digit:hover:not(:disabled),
body.body--dark .rp-num-touchpad__key--action:hover:not(:disabled) {
  filter: brightness(1.12);
}

.rp-num-touchpad__key--spacer {
  background: transparent;
  cursor: default;
  pointer-events: none;
}

.rp-num-touchpad__key--action {
  background: transparent;
}

.rp-num-touchpad__icon {
  color: var(--rp-foreground);
}

/* Круглые клавиши (PIN) */
.rp-num-touchpad--shape-circle .rp-num-touchpad__key--digit {
  max-width: var(--rp-touchpad-key-max-w);
  aspect-ratio: 1;
  height: auto;
  border-radius: 50%;
}

.rp-num-touchpad--shape-circle .rp-num-touchpad__key--action,
.rp-num-touchpad--shape-circle .rp-num-touchpad__key--spacer {
  max-width: var(--rp-touchpad-key-max-w);
  aspect-ratio: 1;
  height: auto;
  border-radius: 50%;
}

/* Прямоугольные клавиши */
.rp-num-touchpad--shape-rounded .rp-num-touchpad__key--digit {
  min-height: var(--rp-touchpad-key-min-h);
  border-radius: var(--rp-touchpad-key-radius);
}

.rp-num-touchpad--shape-rounded .rp-num-touchpad__key--action {
  min-height: var(--rp-touchpad-key-min-h);
  border-radius: var(--rp-touchpad-key-radius);
  background: color-mix(in srgb, var(--rp-secondary) 65%, transparent);
}

.rp-num-touchpad--shape-rounded .rp-num-touchpad__key--spacer {
  min-height: var(--rp-touchpad-key-min-h);
  border-radius: var(--rp-touchpad-key-radius);
}

/* Родитель с ограниченной высотой (flex:1 + min-height:0): клавиши заполняют область */
.rp-num-touchpad--fill-height {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
}

.rp-num-touchpad--fill-height .rp-num-touchpad__main {
  flex: 3 1 0%;
  min-height: 0;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  align-content: stretch;
  justify-items: stretch;
}

.rp-num-touchpad--fill-height .rp-num-touchpad__bottom {
  flex: 1 1 0%;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr);
  align-content: stretch;
  justify-items: stretch;
}

.rp-num-touchpad--fill-height.rp-num-touchpad--shape-rounded .rp-num-touchpad__key--digit,
.rp-num-touchpad--fill-height.rp-num-touchpad--shape-rounded .rp-num-touchpad__key--action,
.rp-num-touchpad--fill-height.rp-num-touchpad--shape-rounded .rp-num-touchpad__key--spacer {
  min-height: 0;
  height: 100%;
  align-self: stretch;
}
</style>
