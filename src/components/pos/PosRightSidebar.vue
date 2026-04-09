<template>
  <aside class="rp-pos-right column no-wrap" aria-label="POS">
    <div class="rp-pos-right__scroll col">
      <q-scroll-area class="rp-pos-right__scroll-area fit" visible>
        <div class="rp-pos-right__scroll-inner">
          <PosCustomerBlock />
          <PosActionsGrid />
          <PosQuickIconRow />
        </div>
      </q-scroll-area>
    </div>
    <div class="rp-pos-right__pay-wrap">
      <PosPaymentBar />
    </div>
  </aside>
</template>

<script setup lang="ts">
import PosActionsGrid from 'src/components/pos/PosActionsGrid.vue';
import PosCustomerBlock from 'src/components/pos/PosCustomerBlock.vue';
import PosPaymentBar from 'src/components/pos/PosPaymentBar.vue';
import PosQuickIconRow from 'src/components/pos/PosQuickIconRow.vue';
</script>

<style scoped lang="scss">
.rp-pos-right {
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: var(--rp-background);
  border-left: 1px solid var(--rp-border);
  box-sizing: border-box;
}

/* Как у корзины: скролл только середины, оплата всегда внизу экрана колонки. */
.rp-pos-right__scroll {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rp-pos-right__scroll-area {
  flex: 1 1 auto;
  min-height: 0;
}

.rp-pos-right__scroll-inner {
  padding-bottom: 12px;
}

.rp-pos-right__pay-wrap {
  flex-shrink: 0;
  border-top: 1px solid var(--rp-border);
  background: var(--rp-background);
}
</style>
