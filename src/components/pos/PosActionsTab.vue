<template>
  <div class="rp-pos-actions-tab column no-wrap">
    <div class="rp-pos-actions-tab__scroll col scroll">
      <PosActionsGrid />
      <PosQuickIconRow />
    </div>
  </div>
</template>

<script setup lang="ts">
import PosActionsGrid from 'src/components/pos/PosActionsGrid.vue';
import PosQuickIconRow from 'src/components/pos/PosQuickIconRow.vue';
</script>

<style scoped lang="scss">
.rp-pos-actions-tab {
  flex: 1;
  min-height: 0;
  background: var(--rp-background);
}

.rp-pos-actions-tab__scroll {
  min-height: 0;
}
</style>
