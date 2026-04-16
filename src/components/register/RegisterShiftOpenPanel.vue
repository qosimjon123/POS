<template>
  <div class="rp-register-shift-open column no-wrap">
    <div ref="cashPadZoneRef" class="rp-register-shift-open__cash-zone">
      <q-input
        v-model="cashAmount"
        outlined
        stack-label
        :disable="disabled"
        :dark="$q.dark.isActive"
        class="rp-register-shift-open__field"
        :label="cashLabel"
        :placeholder="cashPlaceholder"
        inputmode="decimal"
        hide-bottom-space
        @focus="onCashFocus"
        @blur="onCashBlur"
      />
      <RpNumericTouchpad
        v-show="cashPadOpen"
        v-model="cashAmount"
        class="rp-register-shift-open__cash-pad q-mt-sm"
        :size="cashTouchpadSize"
        shape="rounded"
        allow-decimal
        :max-length="cashMaxDigits"
        :aria-label="cashLabel"
      />
    </div>
    <q-input
      v-model="comment"
      outlined
      stack-label
      type="textarea"
      autogrow
      :disable="disabled"
      :dark="$q.dark.isActive"
      class="rp-register-shift-open__field"
      :label="commentLabel"
      :placeholder="commentPlaceholder"
      hide-bottom-space
    />
    <q-btn
      unelevated
      no-caps
      class="rp-ui-btn rp-ui-btn--primary full-width rp-register-shift-open__submit"
      :disable="disabled"
      :label="confirmLabel"
      @click="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    variant?: 'open' | 'close';
  }>(),
  { disabled: false, variant: 'open' },
);

const emit = defineEmits<{
  confirm: [payload: { cash: string; comment: string }];
}>();

const $q = useQuasar();
const { t } = useI18n();

const cashAmount = ref('');
const comment = ref('');

const cashLabel = computed(() =>
  props.variant === 'close'
    ? t('registers.shiftCloseCashLabel')
    : t('registers.shiftOpenCashLabel'),
);

const cashPlaceholder = computed(() =>
  props.variant === 'close'
    ? t('registers.shiftCloseCashPlaceholder')
    : t('registers.shiftOpenCashPlaceholder'),
);

const commentLabel = computed(() =>
  props.variant === 'close'
    ? t('registers.shiftCloseCommentLabel')
    : t('registers.shiftOpenCommentLabel'),
);

const commentPlaceholder = computed(() =>
  props.variant === 'close'
    ? t('registers.shiftCloseCommentPlaceholder')
    : t('registers.shiftOpenCommentPlaceholder'),
);

const confirmLabel = computed(() =>
  props.variant === 'close' ? t('registers.confirmClose') : t('registers.confirmOpen'),
);

const cashPadZoneRef = ref<HTMLElement | null>(null);
const cashPadOpen = ref(false);

const cashTouchpadSize = computed(() => ($q.screen.lt.md ? 'sm' : 'md'));
const cashMaxDigits = 12;

function onDocPointerDown(ev: PointerEvent) {
  if (!cashPadOpen.value || !cashPadZoneRef.value) return;
  const target = ev.target as Node;
  if (!cashPadZoneRef.value.contains(target)) {
    cashPadOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
});

function onCashFocus() {
  if (props.disabled) return;
  cashPadOpen.value = true;
}

function onCashBlur(ev: Event) {
  const next = (ev as FocusEvent).relatedTarget as Node | null;
  if (next && cashPadZoneRef.value && cashPadZoneRef.value.contains(next)) {
    return;
  }
  cashPadOpen.value = false;
}

watch(
  () => props.disabled,
  (d) => {
    if (d) {
      cashAmount.value = '';
      comment.value = '';
      cashPadOpen.value = false;
    }
  },
);

watch(
  () => props.variant,
  () => {
    cashAmount.value = '';
    comment.value = '';
    cashPadOpen.value = false;
  },
);

function onSubmit() {
  emit('confirm', {
    cash: cashAmount.value.trim(),
    comment: comment.value.trim(),
  });
}
</script>

<style scoped lang="scss">
.rp-register-shift-open {
  width: 100%;
  gap: 16px;
}

.rp-register-shift-open__field {
  :deep(.q-field__label) {
    font-weight: 600;
    color: var(--rp-muted-foreground);
  }

  :deep(.q-field__native::placeholder),
  :deep(.q-field__input::placeholder) {
    color: var(--rp-muted-foreground);
    opacity: 0.92;
  }

  :deep(textarea.q-field__native::placeholder) {
    color: var(--rp-muted-foreground);
    opacity: 0.92;
  }
}

.rp-register-shift-open__submit {
  margin-top: 4px;
}
</style>
