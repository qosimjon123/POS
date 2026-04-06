<template>
  <div :class="keyboardClass"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import KeyboardModule from 'simple-keyboard';
import type SimpleKeyboard from 'simple-keyboard';
import type { KeyboardOptions } from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

import type { KeyboardLayoutMode } from 'src/components/common/keyboard-types';

/** UMD main bundle: Vite may expose the class on `.default` instead of the default import. */
const KeyboardCtor =
  typeof KeyboardModule === 'function'
    ? KeyboardModule
    : (KeyboardModule as { default: typeof KeyboardModule }).default;

const props = withDefaults(
  defineProps<{
    layout: KeyboardLayoutMode;
    modelValue: string;
    embedded?: boolean;
  }>(),
  { embedded: false },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const keyboardClass = computed(() =>
  props.embedded
    ? 'rp-simple-keyboard-dom rp-simple-keyboard-dom--embed'
    : 'rp-simple-keyboard-dom',
);

let keyboard: SimpleKeyboard | null = null;

/** Полная QWERTY + русская ЙЦУКЕН; переключение клавишей {lang} (EN ↔ РУ). */
const FULL_LAYOUT = {
  default: [
    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} q w e r t y u i o p [ ] \\',
    "{lock} a s d f g h j k l ; ' {enter}",
    '{shift} z x c v b n m , . / {shift}',
    '{lang} .com @ {space}',
  ],
  shift: [
    '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
    '{tab} Q W E R T Y U I O P { } |',
    '{lock} A S D F G H J K L : " {enter}',
    '{shift} Z X C V B N M < > ? {shift}',
    '{lang} .com @ {space}',
  ],
  ru: [
    'ё 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} й ц у к е н г ш щ з х ъ',
    '{lock} ф ы в а п р о л д ж э {enter}',
    '{shift} я ч с м и т ь б ю . {shift}',
    '{lang} .com @ {space}',
  ],
  ruShift: [
    'Ё ! " № ; % : ? * ( ) _ + {bksp}',
    '{tab} Й Ц У К Е Н Г Ш Щ З Х Ъ',
    '{lock} Ф Ы В А П Р О Л Д Ж Э {enter}',
    '{shift} Я Ч С М И Т Ь Б Ю , {shift}',
    '{lang} .com @ {space}',
  ],
};

const FULL_DISPLAY: Record<string, string> = {
  '{bksp}': '⌫',
  '{tab}': 'Tab',
  '{enter}': 'Enter',
  '{shift}': '⇧',
  '{lock}': '⇪',
  '{lang}': 'EN / РУ',
};

function isEnLayout(name: string | undefined): boolean {
  return name === 'default' || name === 'shift';
}

function isRuLayout(name: string | undefined): boolean {
  return name === 'ru' || name === 'ruShift';
}

function buildOptions(): KeyboardOptions {
  const base: KeyboardOptions = {
    onChange: (input: string) => {
      emit('update:modelValue', input);
    },
    onKeyPress: (button: string) => {
      if (props.layout !== 'full') return;
      if (button === '{shift}' || button === '{lock}') {
        handleShift();
        return;
      }
      if (button === '{lang}') {
        handleLang();
      }
    },
  };

  if (props.layout === 'numeric') {
    base.layout = {
      default: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0'],
    };
    base.display = {
      '{bksp}': '⌫',
    };
    base.mergeDisplay = true;
  } else {
    base.layout = { ...FULL_LAYOUT };
    base.layoutName = 'default';
    base.display = { ...FULL_DISPLAY };
    base.mergeDisplay = true;
  }

  return base;
}

function handleShift() {
  if (!keyboard) return;
  const name = keyboard.options.layoutName;
  let next: string;
  if (isEnLayout(name)) {
    next = name === 'default' ? 'shift' : 'default';
  } else if (isRuLayout(name)) {
    next = name === 'ru' ? 'ruShift' : 'ru';
  } else {
    next = 'default';
  }
  keyboard.setOptions({
    layoutName: next,
  });
}

function handleLang() {
  if (!keyboard) return;
  const name = keyboard.options.layoutName;
  if (isEnLayout(name)) {
    const next = name === 'shift' ? 'ruShift' : 'ru';
    keyboard.setOptions({ layoutName: next });
  } else if (isRuLayout(name)) {
    const next = name === 'ruShift' ? 'shift' : 'default';
    keyboard.setOptions({ layoutName: next });
  }
}

function mountKeyboard() {
  keyboard?.destroy();
  keyboard = new KeyboardCtor(keyboardClass.value, buildOptions());
  keyboard.setInput(props.modelValue ?? '');
}

onMounted(() => {
  mountKeyboard();
});

onBeforeUnmount(() => {
  keyboard?.destroy();
  keyboard = null;
});

watch(
  () => props.layout,
  () => {
    mountKeyboard();
  },
);

watch(
  () => keyboardClass.value,
  () => {
    mountKeyboard();
  },
);

watch(
  () => props.modelValue,
  (input) => {
    if (keyboard) {
      keyboard.setInput(input ?? '');
    }
  },
);
</script>

<style scoped></style>
