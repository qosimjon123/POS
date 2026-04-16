<template>
  <RpWirePlaceholder :label="t('playground.links.customerCreate')">
    <PosCustomerCreateForm
      ref="formRef"
      class="q-mt-sm"
      @valid-change="formValid = $event"
      @save="onSave"
    />
    <div class="row q-gutter-md justify-end q-mt-md">
      <q-btn flat no-caps :label="t('system.cancel')" @click="onCancel" />
      <q-btn
        unelevated
        no-caps
        :disable="!formValid"
        :label="t('system.save')"
        @click="formRef?.submit()"
      />
    </div>
  </RpWirePlaceholder>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import PosCustomerCreateForm from 'src/components/pos/PosCustomerCreateForm.vue';
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';

const { t } = useI18n();

const formRef = ref<InstanceType<typeof PosCustomerCreateForm> | null>(null);
const formValid = ref(false);

function onCancel() {
  /* превью */
}

function onSave() {
  /* превью */
}
</script>
