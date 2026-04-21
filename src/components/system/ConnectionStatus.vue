<template>
  <div class="rp-connection" role="status" :aria-label="ariaLabel">
    <q-icon
      name="wifi"
      size="20px"
      :color="statusColor"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConnectionStore } from 'src/stores/connection';

const { t } = useI18n();
const connectionStore = useConnectionStore();

const statusColor = computed(() => {
  if (!connectionStore.online) return 'negative';
  if (connectionStore.frappeReachable === null) return 'warning';
  return connectionStore.serverConnected ? 'positive' : 'negative';
});

const ariaLabel = computed(() =>
  connectionStore.serverConnected ? t('system.connected') : t('system.disconnected'),
);
</script>
