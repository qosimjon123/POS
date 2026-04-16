<template>
  <div class="rp-wire-shell column no-wrap">
    <RpWirePlaceholder label="Шапка: магазин · касса · связь · время · поиск">
      <div class="row items-center no-wrap q-gutter-sm">
        <div class="rp-fake-chip">Статус</div>
        <div class="col rp-fake-line" />
        <div class="rp-fake-icon" />
        <div class="rp-fake-icon" />
      </div>
    </RpWirePlaceholder>
    <div class="row col no-wrap q-mt-md" style="min-height: 280px">
      <RpWirePlaceholder class="col" label="Основная зона (каталог / контент)">
        <div class="rp-fake-grid">
          <div v-for="n in 6" :key="n" class="rp-fake-tile" />
        </div>
      </RpWirePlaceholder>
    </div>
    <RpWirePlaceholder class="q-mt-md" label="Нижняя навигация (моб.) / боковая (десктоп)" min-h="56px">
      <div class="row justify-around items-center">
        <div v-for="n in 4" :key="n" class="rp-fake-nav-pill" />
      </div>
    </RpWirePlaceholder>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-wire-shell {
  flex: 1;
  min-height: 0;
}

.rp-fake-chip {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
}

.rp-fake-line {
  height: 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}

.rp-fake-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rp-foreground) 10%, transparent);
}

.rp-fake-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.rp-fake-tile {
  aspect-ratio: 1;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rp-foreground) 8%, transparent);
}

.rp-fake-nav-pill {
  width: 48px;
  height: 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 15%, transparent);
}
</style>
