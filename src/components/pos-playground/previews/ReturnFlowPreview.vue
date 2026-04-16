<template>
  <div class="column no-wrap q-gutter-md">
    <RpWirePlaceholder label="Поиск чека / скан">
      <div class="rp-fake-line" />
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Шапка чека (номер, дата, клиент)">
      <div class="row q-gutter-md">
        <div class="col rp-block" />
        <div class="col rp-block" />
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Позиции к возврату (кол-во ≤ проданного)">
      <q-markup-table flat bordered dense class="rp-table">
        <thead>
          <tr>
            <th class="text-left">Товар</th>
            <th class="text-right">Было</th>
            <th class="text-right">Возврат</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 3" :key="n">
            <td><div class="rp-cell-line" /></td>
            <td class="text-right">2</td>
            <td class="text-right">
              <div class="rp-mini-qty" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Причина возврата" tight>
      <div class="rp-fake-select" />
    </RpWirePlaceholder>
    <q-btn outline color="negative" class="full-width" no-caps disable label="Оформить возврат" />
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-fake-line {
  height: 44px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rp-foreground) 6%, transparent);
  border: 1px solid var(--rp-border);
}

.rp-block {
  height: 48px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rp-foreground) 8%, transparent);
}

.rp-table {
  background: var(--rp-card);
}

.rp-cell-line {
  height: 8px;
  max-width: 80%;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 12%, transparent);
}

.rp-mini-qty {
  display: inline-block;
  width: 40px;
  height: 28px;
  margin-left: auto;
  border-radius: 6px;
  border: 1px solid var(--rp-border);
  background: var(--rp-input);
}

.rp-fake-select {
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--rp-border);
}
</style>
