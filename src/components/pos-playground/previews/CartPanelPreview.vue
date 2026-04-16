<template>
  <div class="column no-wrap">
    <RpWirePlaceholder label="Строки корзины (скролл)">
      <div class="column q-gutter-sm">
        <div v-for="i in 3" :key="i" class="rp-line-card row items-center no-wrap">
          <div class="col">
            <div class="rp-line-card__title" />
            <div class="rp-line-card__sub" />
          </div>
          <div class="rp-line-card__price" />
        </div>
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder class="q-mt-md" label="Итоги / черновик / сброс (если не mobile-checkout)">
      <div class="column q-gutter-xs">
        <div class="rp-sum-row"><span>Подытог</span><span class="rp-sum-dim" /></div>
        <div class="rp-sum-row"><span>Скидка</span><span class="rp-sum-dim" /></div>
        <div class="rp-sum-row rp-sum-row--total"><span>К оплате</span><span class="rp-sum-dim" /></div>
      </div>
    </RpWirePlaceholder>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-line-card {
  padding: 10px;
  border-radius: 10px;
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
  gap: 8px;
}

.rp-line-card__title {
  height: 10px;
  max-width: 70%;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 14%, transparent);
}

.rp-line-card__sub {
  margin-top: 6px;
  height: 8px;
  max-width: 40%;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 8%, transparent);
}

.rp-line-card__price {
  width: 56px;
  height: 12px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}

.rp-sum-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--rp-muted-foreground);
}

.rp-sum-row--total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--rp-border);
  font-weight: 700;
  color: var(--rp-foreground);
}

.rp-sum-dim {
  width: 64px;
  height: 10px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}
</style>
