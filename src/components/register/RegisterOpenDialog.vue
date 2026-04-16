<template>
  <q-dialog
    :model-value="modelValue"
    class="rp-register-open-dialog"
    :class="{ 'rp-register-open-dialog--sheet': isSheet }"
    :position="isSheet ? 'bottom' : 'standard'"
    :full-width="isSheet"
    :transition-show="isSheet ? 'slide-up' : 'scale'"
    :transition-hide="isSheet ? 'slide-down' : 'scale'"
    @update:model-value="onUpdateOpen"
    @hide="onHide"
  >
    <q-card
      class="rp-register-open-dialog__card column no-wrap"
      :class="{ 'rp-register-open-dialog__card--sheet': isSheet }"
      :style="sheetCardStyle"
    >
      <div
        v-if="isSheet"
        v-touch-pan.down.mouse.prevent="onHandlePan"
        class="rp-register-open-dialog__handle"
        :aria-label="t('pos.swipeDownToClose')"
      >
        <div class="rp-register-open-dialog__grabber" />
      </div>

      <q-card-section
        class="rp-register-open-dialog__stepper-wrap col"
        :class="{ 'q-pt-none': isSheet }"
      >
        <div class="text-h6 q-mb-sm">{{ dialogTitle }}</div>

        <q-stepper
          v-model="step"
          flat
          animated
          alternative-labels
          color="primary"
          class="rp-register-open-stepper bg-transparent"
        >
          <q-step
            name="checklist"
            :title="checklistStepTitle"
            :done="checklistStepDone"
            :error="checklistStepError"
            done-color="positive"
            error-color="negative"
          >
            <p class="rp-register-open-dialog__intro q-mb-md q-mt-none">
              {{ checklistIntro }}
            </p>

            <div class="rp-register-open-checklist" role="list">
              <div
                v-for="(text, i) in checklistItems"
                :key="i"
                class="rp-register-open-checklist__row"
                :class="{
                  'rp-register-open-checklist__row--done': i < confirmedCount,
                  'rp-register-open-checklist__row--next': i === confirmedCount,
                  'rp-register-open-checklist__row--pending': i > confirmedCount,
                }"
                role="listitem"
              >
                <span class="rp-register-open-checklist__check" aria-hidden="true">
                  <q-icon
                    v-if="i < confirmedCount"
                    name="check"
                    size="16px"
                    class="rp-register-open-checklist__check-icon"
                  />
                </span>
                <p class="rp-register-open-checklist__label">{{ text }}</p>
              </div>
            </div>

            <div class="row items-center justify-end q-mt-md q-gutter-sm no-wrap">
              <q-btn flat no-caps :label="t('system.cancel')" @click="close" />
              <q-btn
                unelevated
                no-caps
                class="rp-ui-btn rp-ui-btn--primary"
                :label="checklistButtonLabel"
                @click="onChecklistPrimary"
              />
            </div>
          </q-step>

          <q-step name="shift" :title="formStepTitle">
            <p v-if="register" class="rp-register-open-dialog__target q-mt-none q-mb-sm">
              {{ register.name }} · {{ register.storeName }}
            </p>
            <p class="rp-register-open-dialog__hint q-mb-md q-mt-none">
              {{ formHint }}
            </p>

            <RegisterShiftOpenPanel
              :key="shiftPanelKey"
              :variant="flow === 'close' ? 'close' : 'open'"
              @confirm="onShiftConfirm"
            />

            <div class="row items-center justify-between q-mt-md no-wrap">
              <q-btn flat no-caps :label="t('system.back')" @click="goBackToChecklist" />
              <q-btn flat no-caps :label="t('system.cancel')" @click="close" />
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { TouchPan } from 'quasar';
import type { TouchPanValue } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

import RegisterShiftOpenPanel from 'src/components/register/RegisterShiftOpenPanel.vue';
import type { PosRegister } from 'src/stores/register-context';

const vTouchPan = TouchPan;

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    register: PosRegister | null;
    /** Открытие или закрытие смены — те же шаги (чеклист + форма). */
    flow?: 'open' | 'close';
    /** Ошибка API после подтверждения: первый шаг красным. */
    submitFailed?: boolean;
  }>(),
  { flow: 'open', submitFailed: false },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [payload: { cash: string; comment: string }];
}>();

const $q = useQuasar();
const i18n = useI18n();
const { t } = i18n;

const isSheet = computed(() => $q.screen.lt.md);

const step = ref<'checklist' | 'shift'>('checklist');
const confirmedCount = ref(0);
const shiftPanelKey = ref(0);

const dragY = ref(0);
const panning = ref(false);
const panMaxY = ref(0);

const dialogTitle = computed(() =>
  props.flow === 'close'
    ? t('registers.closeRegisterTitle')
    : t('registers.openRegisterTitle'),
);

const checklistStepTitle = computed(() => t('registers.checklistStepTitle'));

const checklistIntro = computed(() =>
  props.flow === 'close'
    ? t('registers.closeChecklistIntro')
    : t('registers.openChecklistIntro'),
);

const formStepTitle = computed(() =>
  props.flow === 'close'
    ? t('registers.closeShiftStepTitle')
    : t('registers.openShiftStepTitle'),
);

const formHint = computed(() =>
  props.flow === 'close'
    ? t('registers.closeRegisterHint')
    : t('registers.openRegisterHint'),
);

const checklistItems = computed((): string[] => {
  const key =
    props.flow === 'close'
      ? 'registers.closeChecklistItems'
      : 'registers.openChecklistItems';
  const raw = i18n.tm(key);
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
});

const checklistTotal = computed(() => Math.max(1, checklistItems.value.length));

const checklistStepError = computed(() => props.submitFailed);

const checklistStepDone = computed(() => {
  if (props.submitFailed) return false;
  return confirmedCount.value >= checklistTotal.value;
});

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      step.value = 'checklist';
      confirmedCount.value = 0;
      shiftPanelKey.value += 1;
    } else {
      dragY.value = 0;
    }
  },
);

const sheetCardStyle = computed(() => {
  if (!isSheet.value || dragY.value <= 0) return {};
  return {
    transform: `translateY(${dragY.value}px)`,
    transition: panning.value ? 'none' : 'transform 0.2s ease-out',
  };
});

const onHandlePan: TouchPanValue = (details) => {
  if (!details) return;
  if (details.isFirst) {
    panning.value = true;
    panMaxY.value = 0;
  }
  const y = details.offset?.y ?? 0;
  const down = y > 0 ? y : 0;
  dragY.value = down;
  panMaxY.value = Math.max(panMaxY.value, down);
  if (details.isFinal) {
    panning.value = false;
    const shouldClose = panMaxY.value > 100;
    dragY.value = 0;
    panMaxY.value = 0;
    if (shouldClose) {
      closeDialog();
    }
  }
};

const checklistButtonLabel = computed(() => {
  const total = checklistTotal.value;
  if (confirmedCount.value < total) {
    return t('registers.checklistConfirmNext', {
      next: confirmedCount.value + 1,
      total,
    });
  }
  return t('system.next');
});

function onChecklistPrimary() {
  const total = checklistTotal.value;
  if (confirmedCount.value < total) {
    confirmedCount.value += 1;
    if (confirmedCount.value >= total) {
      step.value = 'shift';
    }
    return;
  }
  step.value = 'shift';
}

function goBackToChecklist() {
  step.value = 'checklist';
}

function onUpdateOpen(v: boolean) {
  emit('update:modelValue', v);
}

function onHide() {
  dragY.value = 0;
}

function closeDialog() {
  emit('update:modelValue', false);
}

function close() {
  closeDialog();
}

function onShiftConfirm(payload: { cash: string; comment: string }) {
  emit('confirm', payload);
}

</script>

<style scoped lang="scss">
.rp-register-open-dialog__card {
  min-width: min(400px, calc(100vw - 32px));
  max-height: min(95vh, 720px);
  background: var(--rp-card);
  color: var(--rp-foreground);
}

.rp-register-open-dialog__card--sheet {
  width: 100%;
  max-height: min(95vh, 720px);
  border-radius: 16px 16px 0 0;
  will-change: transform;
}

.rp-register-open-dialog__handle {
  flex-shrink: 0;
  min-height: 44px;
  padding: 12px 16px 8px;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
}

.rp-register-open-dialog__handle:active {
  cursor: grabbing;
}

.rp-register-open-dialog__grabber {
  width: 40px;
  height: 4px;
  margin: 0 auto;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 28%, transparent);
}

.rp-register-open-dialog__stepper-wrap {
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.rp-register-open-stepper {
  box-shadow: none !important;
}

.rp-register-open-stepper :deep(.q-stepper__header) {
  border-bottom: 1px solid var(--rp-border);
  box-shadow: none;
}

.rp-register-open-stepper :deep(.q-stepper__step-inner) {
  padding: 20px 2px 8px;
}

.rp-register-open-dialog__intro {
  font-size: 14px;
  line-height: 1.45;
  color: var(--rp-muted-foreground);
}

/* Чеклист: один блок, строки как в нативном списке — без «рельс» и карточек на каждый пункт */
.rp-register-open-checklist {
  margin: 0;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-input);
  overflow: hidden;
}

.rp-register-open-checklist__row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--rp-border) 85%, transparent);
  transition: background 0.15s ease;
}

.rp-register-open-checklist__row:last-child {
  border-bottom: none;
}

.rp-register-open-checklist__row--done {
  background: color-mix(in srgb, var(--rp-success) 7%, transparent);
}

.rp-register-open-checklist__row--next {
  background: color-mix(in srgb, var(--rp-primary) 6%, transparent);
}

.rp-register-open-checklist__check {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 2px solid color-mix(in srgb, var(--rp-foreground) 22%, var(--rp-border));
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.rp-register-open-checklist__row--done .rp-register-open-checklist__check {
  border-color: var(--rp-success);
  background: var(--rp-success);
}

.rp-register-open-checklist__row--next .rp-register-open-checklist__check {
  border-color: var(--rp-primary);
  border-width: 2px;
  background: color-mix(in srgb, var(--rp-primary) 10%, transparent);
}

.rp-register-open-checklist__check-icon {
  color: #fff;
  font-weight: 700;
}

.rp-register-open-checklist__label {
  flex: 1;
  margin: 0;
  min-width: 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  color: var(--rp-foreground);
}

.rp-register-open-checklist__row--pending .rp-register-open-checklist__label {
  color: var(--rp-muted-foreground);
}

.rp-register-open-checklist__row--done .rp-register-open-checklist__label {
  color: var(--rp-foreground);
}

.rp-register-open-dialog__target {
  font-size: 15px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-register-open-dialog__hint {
  font-size: 14px;
  line-height: 1.45;
  color: var(--rp-muted-foreground);
}
</style>
