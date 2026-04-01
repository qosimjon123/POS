<template>
  <time class="rp-time" :datetime="isoTime">{{ formatted }}</time>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTimeStore } from 'src/stores/time';

const { locale } = useI18n();
const timeStore = useTimeStore();

const formatted = computed(() => {
  const d = new Date(timeStore.now);
  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
});

const isoTime = computed(() => new Date(timeStore.now).toISOString());

onMounted(() => {
  timeStore.ensureTick();
});

onUnmounted(() => {
  timeStore.stopTick();
});
</script>

<style scoped lang="scss">
.rp-time {
  font-size: 18px;
  font-weight: 500;
  color: var(--rp-foreground);
}
</style>
