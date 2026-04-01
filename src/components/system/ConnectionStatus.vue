<template>
  <div class="rp-connection" role="status" :aria-label="ariaLabel">
    <q-icon
      name="wifi"
      size="20px"
      :color="connectionStore.online ? 'positive' : 'negative'"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConnectionStore } from 'src/stores/connection';

const { t } = useI18n();
const connectionStore = useConnectionStore();

const ariaLabel = computed(() =>
  connectionStore.online ? t('system.connected') : t('system.disconnected'),
);

onMounted(() => {
  connectionStore.syncFromNavigator();
  connectionStore.bindWindowEvents();
});

onUnmounted(() => {
  connectionStore.unbindWindowEvents();
});
</script>
