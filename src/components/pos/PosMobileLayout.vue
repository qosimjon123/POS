<template>
  <div class="rp-pos-mobile-layout column no-wrap col">
    <PosHeader
      v-model:search="search"
      header-layout="mobile"
      :show-locale-theme-settings="false"
      :show-client-chip="false"
      :show-cashier-avatar="false"
    />

    <div
      class="rp-pos-mobile-layout__body col column no-wrap"
      :class="{ 'rp-pos-mobile-layout__body--checkout': mobileTab === 'checkout' }"
    >
      <div
        class="rp-pos-mobile col column no-wrap"
        :class="{ 'rp-pos-mobile--checkout': mobileTab === 'checkout' }"
      >
        <PosProductsPanel v-if="mobileTab === 'products'" />
        <PosCheckoutTab v-else-if="mobileTab === 'checkout'" />
        <PosActionsTab v-else-if="mobileTab === 'actions'" />
        <PosProfilePanel v-else />
      </div>
    </div>

    <PosBottomNav v-model="mobileTab" />
  </div>
</template>

<script setup lang="ts">
import PosActionsTab from 'src/components/pos/PosActionsTab.vue';
import PosBottomNav from 'src/components/pos/PosBottomNav.vue';
import PosCheckoutTab from 'src/components/pos/PosCheckoutTab.vue';
import PosHeader from 'src/components/pos/PosHeader.vue';
import type { PosMobileTab } from 'src/components/pos/pos-mobile-tab';
import PosProductsPanel from 'src/components/pos/PosProductsPanel.vue';
import PosProfilePanel from 'src/components/pos/PosProfilePanel.vue';

const search = defineModel<string>('search', { required: true });
const mobileTab = defineModel<PosMobileTab>('mobileTab', { required: true });
</script>

<style scoped lang="scss">
.rp-pos-mobile-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.rp-pos-mobile-layout__body {
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* «Чек»: скролл только внутри корзины (QScrollArea), иначе жесты уходит в оболочку */
.rp-pos-mobile-layout__body--checkout {
  overflow-y: hidden;
  overscroll-behavior: contain;
}

.rp-pos-mobile {
  min-height: 0;
  flex: 1 1 0%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* «Чек»: колонка на всю высоту под шапку, скролл внутри корзины и при необходимости вкладки */
.rp-pos-mobile--checkout {
  flex: 1 1 0%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
