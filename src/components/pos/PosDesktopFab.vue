<template>
  <div class="rp-pos-desktop-fab" role="toolbar" :aria-label="t('pos.desktopFab')">
    <q-btn
      round
      unelevated
      class="rp-pos-desktop-fab__btn"
      :class="{ 'rp-pos-desktop-fab__btn--active': compactGrid }"
      icon="grid_view"
      :aria-pressed="compactGrid"
      :aria-label="t('pos.toggleGridDensity')"
      @click="$emit('toggle-grid')"
    />
    <q-btn
      round
      unelevated
      class="rp-pos-desktop-fab__btn"
      icon="keyboard"
      :aria-label="t('pos.openKeyboard')"
      @click="$emit('keyboard')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  compactGrid: boolean;
}>();

defineEmits<{
  'toggle-grid': [];
  keyboard: [];
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.rp-pos-desktop-fab {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
}

.rp-pos-desktop-fab__btn {
  background: var(--rp-card) !important;
  color: var(--rp-foreground) !important;
  border: 1px solid var(--rp-border);
  box-shadow: var(--rp-shadow-md);
}

.rp-pos-desktop-fab__btn--active {
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
  border-color: transparent;
}
</style>
