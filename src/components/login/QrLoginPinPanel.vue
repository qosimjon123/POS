<template>
  <div class="rp-pin-card column">
    <div class="rp-pin-head">
      <div class="rp-pin-title-wrap">
        <p class="rp-pin-title">
          {{
            scanned ? t('login.pinEnterTitle') : t('login.pinLockedTitle')
          }}
        </p>
      </div>
      <div class="rp-lock-badge flex flex-center">
        <q-icon name="lock" size="24px" class="rp-icon-muted" />
      </div>
    </div>

    <div class="rp-pin-dots row justify-center">
      <span
        v-for="i in 4"
        :key="i"
        class="rp-pin-dot"
        :class="{
          'rp-pin-dot--filled': scanned && pin.length >= i,
        }"
      />
    </div>

    <div class="rp-numpad" :class="{ 'rp-numpad--disabled': !scanned }">
      <button
        v-for="n in numKeys"
        :key="n.key"
        type="button"
        class="rp-num-btn"
        :class="{
          'rp-num-btn--empty': n.key === 'empty',
          'rp-num-btn--action': n.key === 'back',
        }"
        :disabled="!scanned || n.key === 'empty'"
        @click="onNumKey(n.key)"
      >
        <template v-if="n.key === 'back'">
          <q-icon name="backspace" size="28px" class="rp-icon-fg" />
        </template>
        <template v-else-if="n.key !== 'empty'">{{ n.label }}</template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  scanned: boolean;
  pin: string;
}>();

const emit = defineEmits<{
  'update:pin': [value: string];
}>();

const numKeys = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6', label: '6' },
  { key: '7', label: '7' },
  { key: '8', label: '8' },
  { key: '9', label: '9' },
  { key: 'empty', label: '' },
  { key: '0', label: '0' },
  { key: 'back', label: '' },
] as const;

function onNumKey(key: string) {
  if (!props.scanned) return;
  if (key === 'back') {
    emit('update:pin', props.pin.slice(0, -1));
    return;
  }
  if (props.pin.length >= 4) return;
  emit('update:pin', props.pin + key);
}
</script>

<style scoped lang="scss">
.rp-pin-card {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  background: var(--rp-muted);
  border-radius: 12px;
  padding: 46px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.rp-pin-head {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 38px;
  min-width: 0;
}

.rp-pin-title-wrap {
  flex: 1 1 0;
  min-width: 0;
}

.rp-pin-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--rp-foreground);
  margin: 0;
  line-height: 1.35;
  overflow-wrap: anywhere;
  hyphens: auto;
}

.rp-lock-badge {
  flex-shrink: 0;
  width: 46px;
  min-width: 46px;
  height: 46px;
  border-radius: 23px;
  background: var(--rp-card);
}

.rp-pin-dots {
  flex-wrap: wrap;
  gap: clamp(12px, 4vw, 30px);
  margin-bottom: 42px;
  opacity: 0.55;
}

.rp-pin-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--rp-muted-foreground);
  background: transparent;
}

.rp-pin-dot--filled {
  background: var(--rp-foreground);
  border-color: var(--rp-foreground);
}

.rp-numpad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  max-width: 100%;
  gap: clamp(10px, 3vw, 21px) clamp(10px, 4vw, 30px);
  justify-items: center;
  justify-content: center;
  margin-top: auto;
  box-sizing: border-box;
}

.rp-numpad--disabled {
  opacity: 0.42;
  pointer-events: none;
}

.rp-num-btn {
  box-sizing: border-box;
  width: 100%;
  max-width: 85px;
  aspect-ratio: 1;
  height: auto;
  border-radius: 50%;
  border: none;
  background: var(--rp-secondary);
  color: var(--rp-foreground);
  font-size: clamp(22px, 7vw, 34px);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rp-num-btn:disabled {
  cursor: default;
}

.rp-num-btn--empty {
  background: transparent;
}

.rp-num-btn--action {
  background: transparent;
}

.rp-icon-fg {
  color: var(--rp-foreground);
}

.rp-icon-muted {
  color: var(--rp-muted-foreground);
}

@media (max-width: 480px) {
  .rp-pin-card {
    padding: 24px 16px;
  }

  .rp-pin-head {
    margin-bottom: 28px;
  }
}
</style>
