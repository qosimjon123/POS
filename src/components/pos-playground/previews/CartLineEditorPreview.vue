<template>
  <div class="column no-wrap q-gutter-md">
    <RpWirePlaceholder label="Карточка позиции (sheet / боковая панель)">
      <div class="text-subtitle2 q-mb-sm">Товар · вариант</div>
      <div class="row items-center q-gutter-md q-mb-md">
        <span class="text-caption text-grey-7">Кол-во</span>
        <div class="row items-center q-gutter-sm">
          <q-btn outline round dense icon="remove" disable />
          <div class="rp-qty-box">1</div>
          <q-btn outline round dense icon="add" disable />
        </div>
      </div>
      <RpWirePlaceholder label="Модификаторы / add-ons" tight>
        <div class="column q-gutter-xs">
          <div v-for="n in 3" :key="n" class="rp-mod-row row items-center">
            <div class="col rp-fake-line" />
            <q-checkbox disable :model-value="n === 1" dense />
          </div>
        </div>
      </RpWirePlaceholder>
      <div class="row justify-end q-mt-md">
        <q-btn unelevated color="primary" no-caps disable label="Применить" />
      </div>
    </RpWirePlaceholder>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-qty-box {
  min-width: 36px;
  text-align: center;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--rp-border);
  background: var(--rp-card);
}

.rp-mod-row .rp-fake-line {
  height: 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 10%, transparent);
}
</style>
