<template>
  <div class="rp-connection">
    <q-icon
      name="wifi"
      size="20px"
      :color="statusColor"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConnectionStore } from 'src/stores/connection';

const connectionStore = useConnectionStore();

const statusColor = computed(() => {
  if (connectionStore.serverConnected === null) return 'warning';
  return connectionStore.serverConnected ? 'positive' : 'negative';
});
</script>
