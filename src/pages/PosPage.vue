<template>
  <q-page class="rp-pos-page column no-wrap">
    <RpKeyboard type="full" position="floating">
      <div class="rp-pos-page__inner column no-wrap col">
        <PosDesktopLayout v-if="posShell === 'desktop'" v-model:search="searchQuery" />
        <PosMobileLayout
          v-else
          v-model:search="searchQuery"
          v-model:mobile-tab="mobileTab"
        />
        <PosLineItemDialog />
      </div>
    </RpKeyboard>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

import RpKeyboard from 'src/components/common/RpKeyboard.vue';
import PosDesktopLayout from 'src/components/pos/PosDesktopLayout.vue';
import PosLineItemDialog from 'src/components/pos/PosLineItemDialog.vue';
import PosMobileLayout from 'src/components/pos/PosMobileLayout.vue';
import type { PosMobileTab } from 'src/components/pos/pos-mobile-tab';
import { resolvePosShell, type PosShell } from 'src/components/pos/pos-layout';

const $q = useQuasar();

const posShell = computed((): PosShell => resolvePosShell($q.screen.lt.md));

const searchQuery = ref('');
const mobileTab = ref<PosMobileTab>('products');
</script>

<style scoped lang="scss">
.rp-pos-page {
  box-sizing: border-box;
  background: var(--rp-background);
  color: var(--rp-foreground);
  /* Одна высота с видимой областью окна; без вертикального скролла у всей страницы */
  min-height: 100dvh !important;
  max-height: 100dvh;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.rp-pos-page__inner {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>
