<template>
  <div class="rp-settings-btn-wrap">
    <q-btn
      round
      flat
      dense
      padding="sm"
      class="rp-settings-circle"
      :aria-label="t('system.openSettings')"
      @click="serverStore.openSettingsDialog()"
    >
      <q-icon name="settings" size="18px" class="rp-icon-fg" />
    </q-btn>

    <ServerSettingsDialog />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ServerSettingsDialog from 'src/components/system/ServerSettingsDialog.vue';
import { useServerSettingsStore } from 'src/stores/server-settings';

const { t } = useI18n();
const serverStore = useServerSettingsStore();
</script>

<style scoped lang="scss">
.rp-settings-btn-wrap {
  display: inline-flex;
  align-items: center;
}

.rp-settings-circle {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: var(--rp-card);
}

.rp-icon-fg {
  color: var(--rp-foreground);
}
</style>
