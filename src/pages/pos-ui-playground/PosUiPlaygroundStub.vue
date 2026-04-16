<template>
  <q-page class="rp-playground-stub-page column no-wrap fit">
    <template v-if="known">
      <header
        class="rp-playground-stub-page__bar row items-center no-wrap q-px-sm q-py-sm"
      >
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          :aria-label="t('playground.backToList')"
          :to="{ name: 'pos-ui-playground' }"
        />
        <div class="col q-px-sm min-w-0">
          <div class="text-subtitle1 text-weight-medium ellipsis">{{ title }}</div>
        </div>
        <q-chip size="sm" outline square color="grey-7">{{ t('playground.previewBadge') }}</q-chip>
      </header>
      <q-separator />
      <div class="rp-playground-stub-page__body col scroll q-pa-md">
        <component :is="previewComponent" />
      </div>
    </template>
    <template v-else>
      <div class="col flex flex-center column q-pa-md">
        <q-icon name="error_outline" size="56px" color="negative" class="q-mb-md" />
        <div class="text-h6 text-center">{{ t('playground.unknownSlug') }}</div>
        <div class="text-caption font-mono q-mt-sm">{{ slug }}</div>
        <q-btn
          class="q-mt-lg"
          outline
          color="primary"
          no-caps
          icon="list"
          :label="t('playground.backToList')"
          :to="{ name: 'pos-ui-playground' }"
        />
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { PLAYGROUND_PREVIEW_BY_SLUG } from 'src/components/pos-playground/previewRegistry';
import {
  isPlaygroundSlug,
  PLAYGROUND_LINKS,
  type PlaygroundSlug,
} from 'src/pages/pos-ui-playground/playground-links';

const route = useRoute();
const { t } = useI18n();

const slug = computed(() => String(route.params.slug ?? ''));
const known = computed(() => isPlaygroundSlug(slug.value));

const title = computed(() => {
  if (!known.value) return '';
  const row = PLAYGROUND_LINKS.find((x) => x.slug === slug.value);
  return row ? t(row.labelKey) : slug.value;
});

const previewComponent = computed(() =>
  known.value ? PLAYGROUND_PREVIEW_BY_SLUG[slug.value as PlaygroundSlug] : null,
);
</script>

<style scoped lang="scss">
.rp-playground-stub-page {
  background: var(--rp-background);
  color: var(--rp-foreground);
  /* q-scroll-area требует высоту у цепочки flex; fit + min-height даёт область скролла */
  min-height: 100%;
}

.rp-playground-stub-page__bar {
  flex-shrink: 0;
  background: var(--rp-card);
  border-bottom: 1px solid var(--rp-border);
  padding-top: max(4px, var(--rp-safe-inset-top));
}

.rp-playground-stub-page__body {
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
</style>
