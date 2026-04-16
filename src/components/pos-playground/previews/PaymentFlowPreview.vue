<template>
  <div class="column no-wrap q-gutter-md">
    <RpWirePlaceholder label="К оплате">
      <div class="text-h6 text-right">9 999,00</div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Способы оплаты (из POS Profile)">
      <div class="row q-gutter-sm wrap">
        <div v-for="m in modes" :key="m" class="rp-pay-tile">{{ m }}</div>
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Сумма по выбранному способу · split">
      <div class="rp-field row items-center justify-between q-px-md">
        <span class="text-caption text-grey-7">Введите сумму</span>
        <span class="text-weight-medium">—</span>
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Цифровая панель / скан чека">
      <div class="rp-numpad">
        <div v-for="k in numpadKeys" :key="k" class="rp-key">{{ k }}</div>
      </div>
    </RpWirePlaceholder>
    <q-btn unelevated color="primary" class="full-width" no-caps disable label="Подтвердить оплату" />
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';

const modes = ['Наличные', 'Карта', 'Кошелёк', 'В кредит'];
const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '��'];
</script>

<style scoped lang="scss">
.rp-pay-tile {
  flex: 1 1 40%;
  min-width: 120px;
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  border: 1px solid var(--rp-border);
  background: var(--rp-card);
  font-size: 13px;
  font-weight: 500;
}

.rp-field {
  height: 48px;
  border-radius: 10px;
  border: 1px dashed var(--rp-border);
  background: color-mix(in srgb, var(--rp-muted) 40%, transparent);
}

.rp-numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.rp-key {
  padding: 14px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid var(--rp-border);
  background: var(--rp-card);
  font-weight: 600;
}
</style>
