<template>
  <q-dialog
    v-model="open"
    :position="isSheet ? 'bottom' : 'standard'"
    :full-width="isSheet"
    class="rp-pos-customer-create-dialog"
    :class="{ 'rp-pos-customer-create-dialog--sheet': isSheet }"
    :transition-show="isSheet ? 'slide-up' : 'scale'"
    :transition-hide="isSheet ? 'slide-down' : 'scale'"
    @show="onDialogShow"
    @hide="onDialogHide"
  >
    <q-card
      :dark="$q.dark.isActive"
      class="rp-pos-customer-create-dialog__card"
      :class="
        isSheet
          ? 'rp-pos-customer-create-dialog__card--sheet'
          : 'rp-pos-customer-create-dialog__card--desktop'
      "
      :style="isSheet ? cardTransformStyle : undefined"
    >
      <div
        v-if="isSheet"
        v-touch-pan.down.mouse.prevent="onHandlePan"
        class="rp-pos-customer-create-dialog__handle"
        :aria-label="t('pos.swipeDownToClose')"
      >
        <div class="rp-pos-customer-create-dialog__grabber" />
      </div>

      <q-card-section class="rp-pos-customer-create-dialog__header">
        <h2 class="rp-pos-customer-create-dialog__title">
          {{ t('pos.createCustomerTitle') }}
        </h2>
        <q-btn
          flat
          round
          dense
          :dark="$q.dark.isActive"
          icon="close"
          class="rp-pos-customer-create-dialog__close"
          :aria-label="t('system.cancel')"
          @click="close"
        />
      </q-card-section>

      <q-card-section class="rp-pos-customer-create-dialog__body">
        <PosCustomerCreateForm
          ref="formRef"
          @valid-change="formValid = $event"
          @save="onSave"
        />
      </q-card-section>

      <q-card-section class="rp-pos-customer-create-dialog__footer">
        <q-btn
          flat
          no-caps
          padding="none"
          :dark="$q.dark.isActive"
          class="rp-pos-customer-create-dialog__btn-cancel"
          :label="t('system.cancel')"
          @click="close"
        />
        <q-btn
          unelevated
          no-caps
          :dark="$q.dark.isActive"
          class="rp-pos-customer-create-dialog__btn-save"
          :label="t('system.save')"
          :disable="!formValid"
          @click="onSaveClick"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { TouchPan } from 'quasar';
import type { TouchPanValue } from 'quasar';
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

import PosCustomerCreateForm, {
  type PosCustomerCreatePayload,
} from 'src/components/pos/PosCustomerCreateForm.vue';
import { useScanner } from 'src/stores/scanner';

const vTouchPan = TouchPan;

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  saved: [payload: PosCustomerCreatePayload];
}>();

const { t } = useI18n();
const $q = useQuasar();
const scanner = useScanner();

const isSheet = computed(() => $q.screen.lt.md);

const formRef = ref<InstanceType<typeof PosCustomerCreateForm> | null>(null);
const formValid = ref(false);
const dragY = ref(0);
const panning = ref(false);
const panMaxY = ref(0);

const cardTransformStyle = computed(() => {
  const y = dragY.value;
  if (y <= 0) return {};
  return {
    transform: `translateY(${y}px)`,
    transition: panning.value ? 'none' : 'transform 0.2s ease-out',
  };
});

const onHandlePan: TouchPanValue = (details) => {
  if (!details || !isSheet.value) return;
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
    const close = panMaxY.value > 100;
    dragY.value = 0;
    panMaxY.value = 0;
    if (close) {
      open.value = false;
    }
  }
};

function close() {
  open.value = false;
}

function onSaveClick() {
  formRef.value?.submit();
}

async function onDialogShow() {
  dragY.value = 0;
  formValid.value = false;
  await nextTick();
  formRef.value?.reset();
}

function onDialogHide() {
  dragY.value = 0;
  scanner.resetRuntimeState();
}

function onSave(payload: PosCustomerCreatePayload) {
  emit('saved', payload);
  open.value = false;
}
</script>

<style scoped lang="scss">
:deep(.rp-pos-customer-create-dialog .q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0.6);
}

:deep(.rp-pos-customer-create-dialog--sheet .q-dialog__inner) {
  padding: 0;
}

.rp-pos-customer-create-dialog__card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--rp-card) !important;
  color: var(--rp-foreground) !important;
  border: 1px solid var(--rp-border);
  box-shadow: 0 10px 40px color-mix(in srgb, #000 20%, transparent);
  will-change: transform;
}

.rp-pos-customer-create-dialog__card--sheet {
  width: 100%;
  height: 95vh;
  max-height: 95vh;
  border-radius: 16px 16px 0 0;
}

.rp-pos-customer-create-dialog__card--desktop {
  width: 100%;
  max-width: 400px;
  border-radius: var(--rp-radius-sm);
  max-height: min(95vh, 812px);
}

.rp-pos-customer-create-dialog__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 20px 24px;
}

.rp-pos-customer-create-dialog__title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--rp-foreground);
}

.rp-pos-customer-create-dialog__close {
  color: var(--rp-foreground) !important;
  flex-shrink: 0;
}

.rp-pos-customer-create-dialog__body {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 24px 8px;
}

.rp-pos-customer-create-dialog__footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 24px;
  padding: 16px 24px max(24px, var(--rp-safe-inset-bottom));
}

.rp-pos-customer-create-dialog__btn-cancel {
  font-size: 15px;
  font-weight: 500;
  color: var(--rp-foreground) !important;
  min-height: 44px;
}

.rp-pos-customer-create-dialog__btn-cancel :deep(.q-btn__content) {
  color: var(--rp-foreground) !important;
  opacity: 1;
}

.rp-pos-customer-create-dialog__btn-save {
  min-height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: var(--rp-radius-sm);
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}

.rp-pos-customer-create-dialog__btn-save :deep(.q-btn__content) {
  color: var(--rp-primary-foreground) !important;
}

.rp-pos-customer-create-dialog__btn-save.q-btn--disabled {
  opacity: 0.5;
}

.rp-pos-customer-create-dialog__handle {
  flex-shrink: 0;
  min-height: 48px;
  padding: 12px 16px 8px;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
}

.rp-pos-customer-create-dialog__handle:active {
  cursor: grabbing;
}

.rp-pos-customer-create-dialog__grabber {
  width: 40px;
  height: 4px;
  margin: 0 auto;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 28%, transparent);
}
</style>

<!-- Карточка в портале: color-scheme для нативных полей и системных оттенков. -->
<style lang="scss">
.rp-pos-customer-create-dialog__card {
  color-scheme: light;
}

:root:has(body.body--dark) .rp-pos-customer-create-dialog__card {
  color-scheme: dark;
}
</style>
