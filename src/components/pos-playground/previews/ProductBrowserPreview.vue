<template>
  <div class="column no-wrap q-gutter-md">
    <RpWirePlaceholder label="Поиск · скан" tight>
      <div class="rp-fake-line" style="max-width: 100%" />
    </RpWirePlaceholder>
    <div class="row q-gutter-xs no-wrap scroll" style="overflow-x: auto">
      <div v-for="c in categories" :key="c" class="rp-cat-pill">{{ c }}</div>
    </div>
    <RpWirePlaceholder label="Сетка товаров">
      <div class="rp-product-grid">
        <div v-for="n in 8" :key="n" class="rp-product-card">
          <div class="rp-product-card__img" />
          <div class="rp-product-card__line" />
          <div class="rp-product-card__line rp-product-card__line--short" />
        </div>
      </div>
    </RpWirePlaceholder>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';

const categories = ['Все', 'Напитки', 'Выпечка', 'Горячее', 'Соусы'];
</script>

<style scoped lang="scss">
.rp-fake-line {
  height: 10px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}

.rp-cat-pill {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
}

.rp-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.rp-product-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
}

.rp-product-card__img {
  aspect-ratio: 1;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rp-foreground) 6%, transparent);
}

.rp-product-card__line {
  height: 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}

.rp-product-card__line--short {
  width: 55%;
}
</style>
