<template>
  <div class="column no-wrap q-gutter-md">
    <div class="row q-gutter-xs justify-center q-mb-sm">
      <q-chip dense outline color="primary">Шаг 1</q-chip>
      <q-icon name="chevron_right" size="18px" class="text-grey-5" />
      <q-chip dense outline>Шаг 2</q-chip>
      <q-icon name="chevron_right" size="18px" class="text-grey-5" />
      <q-chip dense outline>Шаг 3</q-chip>
    </div>
    <RpWirePlaceholder label="Сверка по способам оплаты">
      <div class="column q-gutter-sm">
        <div v-for="n in 3" :key="n" class="rp-close-row row items-center no-wrap q-gutter-md">
          <div class="col text-body2">Режим {{ n }}</div>
          <div class="rp-mini-field" />
          <div class="rp-mini-field" />
        </div>
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Расхождения · комментарий">
      <div class="rp-note" />
    </RpWirePlaceholder>
    <div class="row q-gutter-sm justify-end">
      <q-btn flat no-caps label="Назад" disable />
      <q-btn unelevated color="primary" no-caps label="Закрыть смену" disable />
    </div>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-close-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--rp-border);
}

.rp-mini-field {
  width: 88px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--rp-border);
  background: var(--rp-card);
}

.rp-note {
  min-height: 64px;
  border-radius: 8px;
  border: 1px dashed var(--rp-border);
}
</style>
