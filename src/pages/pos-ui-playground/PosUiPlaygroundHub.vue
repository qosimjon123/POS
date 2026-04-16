<template>
  <q-page class="rp-playground-hub column no-wrap q-pa-md">
    <div class="rp-playground-hub__head q-mb-lg">
      <div class="text-h5">{{ t('playground.title') }}</div>
      <div class="text-body2 text-grey-7 q-mt-xs">{{ t('playground.subtitle') }}</div>
      <div class="q-mt-md">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          icon="arrow_back"
          :label="t('playground.backToApp')"
          :to="{ name: 'pos' }"
        />
      </div>
    </div>

    <q-list bordered separator class="rounded-borders">
      <q-item
        v-for="item in PLAYGROUND_LINKS"
        :key="item.slug"
        clickable
        :to="{ name: 'pos-ui-playground-stub', params: { slug: item.slug } }"
      >
        <q-item-section>
          <q-item-label>{{ t(item.labelKey) }}</q-item-label>
          <q-item-label caption class="font-mono">/pos-ui-playground/view/{{ item.slug }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="text-grey-5" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { PLAYGROUND_LINKS } from 'src/pages/pos-ui-playground/playground-links';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.rp-playground-hub {
  max-width: 720px;
  margin-inline: auto;
  box-sizing: border-box;
}
</style>
