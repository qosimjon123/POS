<template>
  <q-dialog v-model="dialogVisible">
    <q-card class="rp-server-dialog">
      <q-card-section class="q-pb-none">
        <div class="rp-dialog-title">{{ t('system.serverSettingsTitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="dialogDraftBaseUrl"
          outlined
          stack-label
          hide-hint
          class="rp-server-field"
          color="primary"
          :dark="$q.dark.isActive"
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
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import { useServerSettingsStore } from 'src/stores/server-settings';

const $q = useQuasar();
const { t } = useI18n();
const serverStore = useServerSettingsStore();

const { dialogDraftBaseUrl, settingsUrlInvalid } = storeToRefs(serverStore);

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
  background: var(--rp-primary);
  color: var(--rp-primary-foreground);
}

/* Same as login fields: Quasar + dark card — label focus color from design tokens */
.rp-server-field :deep(.q-field__native),
.rp-server-field :deep(.q-field__native input) {
  color: var(--rp-foreground);
}

.rp-server-field :deep(.q-field__label) {
  color: var(--rp-muted-foreground);
}

/* stack-label: float всегда true — цвет акцента только при фокусе */
.rp-server-field :deep(.q-field--focused .q-field__label),
.rp-server-field :deep(.q-field--highlighted .q-field__label) {
  color: var(--rp-primary);
}

.rp-server-field :deep(.q-field__marginal) {
  color: var(--rp-muted-foreground);
}

</style>
