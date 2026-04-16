<template>
  <div class="column no-wrap q-gutter-lg flex flex-center" style="min-height: 320px">
    <q-icon name="schedule" size="48px" color="primary" />
    <div class="text-h6 text-center">{{ t('registers.openShiftStepTitle') }}</div>
    <RegisterShiftOpenPanel class="full-width" style="max-width: 360px" disabled />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RegisterShiftOpenPanel from 'src/components/register/RegisterShiftOpenPanel.vue';

const { t } = useI18n();
</script>
