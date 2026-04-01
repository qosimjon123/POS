<template>
  <q-dialog v-model="dialogVisible">
    <q-card class="rp-server-dialog">
      <q-card-section class="q-pb-none">
        <div class="rp-dialog-title">{{ t('system.serverSettingsTitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="settingsDraftUrl"
          outlined
          :label="t('system.serverUrlLabel')"
          type="url"
          autocomplete="url"
          :placeholder="t('system.serverUrlPlaceholder')"
          :hint="t('system.serverUrlHint')"
          :error="settingsUrlInvalid"
          :error-message="settingsUrlInvalid ? t('system.serverUrlInvalid') : undefined"
          @keyup.enter="serverStore.saveSettingsFromDialog()"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps :label="t('system.cancel')" @click="serverStore.closeSettingsDialog()" />
        <q-btn
          unelevated
          no-caps
          class="rp-dialog-save"
          :label="t('system.save')"
          @click="serverStore.saveSettingsFromDialog()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useServerSettingsStore } from 'src/stores/server-settings';

const { t } = useI18n();
const serverStore = useServerSettingsStore();

const { settingsDraftUrl, settingsUrlInvalid } = storeToRefs(serverStore);

const dialogVisible = computed({
  get: () => serverStore.settingsDialogOpen,
  set: (v: boolean) => {
    if (!v) serverStore.closeSettingsDialog();
  },
});
</script>

<style scoped lang="scss">
.rp-server-dialog {
  width: min(100vw - 32px, 420px);
  background: var(--rp-card);
  color: var(--rp-foreground);
}

.rp-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.rp-dialog-save {
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}
</style>
