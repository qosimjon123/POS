<template>
  <div class="column no-wrap q-gutter-md">
    <div class="text-caption text-grey-7">Нижняя шторка / боковая панель кухни</div>
    <RpWirePlaceholder label="Тикет · стол · время">
      <div class="row items-center no-wrap q-gutter-md">
        <q-chip dense color="primary" text-color="white">Стол 7</q-chip>
        <div class="col rp-fake-line" />
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Позиции KOT">
      <div class="column q-gutter-xs">
        <div v-for="n in 4" :key="n" class="rp-kot-line row items-center">
          <q-checkbox :model-value="n > 2" dense disable />
          <div class="col">
            <div class="rp-line-title" />
            <div class="rp-line-note" />
          </div>
        </div>
      </div>
    </RpWirePlaceholder>
    <div class="row q-gutter-sm">
      <q-btn outline class="col" no-caps disable label="Печать" icon="print" />
      <q-btn outline class="col" no-caps disable label="Отмена" icon="cancel" />
      <q-btn unelevated color="primary" class="col" no-caps disable label="Отправить" />
    </div>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-fake-line {
  height: 10px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}

.rp-kot-line {
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
}

.rp-line-title {
  height: 9px;
  width: 65%;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 14%, transparent);
}

.rp-line-note {
  margin-top: 4px;
  height: 7px;
  width: 40%;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 8%, transparent);
}
</style>
