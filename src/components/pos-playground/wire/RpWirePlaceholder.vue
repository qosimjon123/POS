<template>
  <div
    class="rp-wire-ph"
    :class="{ 'rp-wire-ph--tight': tight }"
    :style="boxStyle"
  >
    <span v-if="label" class="rp-wire-ph__label text-caption">{{ label }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    /** Минимальная высота, например 48px */
    minH?: string;
    tight?: boolean;
  }>(),
  { tight: false },
);

const boxStyle = computed(() => (props.minH ? { minHeight: props.minH } : undefined));
</script>

<style scoped lang="scss">
.rp-wire-ph {
  border: 1px dashed var(--rp-border);
  border-radius: var(--rp-radius-md, 8px);
  background: color-mix(in srgb, var(--rp-muted) 55%, transparent);
  padding: 12px;
  box-sizing: border-box;
}

.rp-wire-ph--tight {
  padding: 8px 10px;
}

.rp-wire-ph__label {
  display: block;
  color: var(--rp-muted-foreground);
  margin-bottom: 8px;
}
</style>
