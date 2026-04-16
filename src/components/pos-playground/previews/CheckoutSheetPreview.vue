<template>
  <div class="column no-wrap q-gutter-md">
    <RpWirePlaceholder label="Ручка · свайп закрыть">
      <div class="rp-handle" />
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Клиент">
      <div class="rp-fake-select" />
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Скидки · купон">
      <div class="row q-gutter-sm">
        <div class="col rp-pill" />
        <div class="col rp-pill" />
      </div>
      <div class="rp-fake-input q-mt-sm" />
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Сводка чека">
      <div v-for="n in 4" :key="n" class="rp-sum-line row justify-between q-mb-xs">
        <div class="rp-dots" />
        <div class="rp-dots rp-dots--short" />
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Оплата (крупная кнопка)">
      <q-btn
        unelevated
        color="primary"
        class="full-width"
        no-caps
        disable
        label="Оплатить"
        style="min-height: 56px"
      />
    </RpWirePlaceholder>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.rp-handle {
  width: 40px;
  height: 4px;
  margin: 0 auto;
  border-radius: 4px;
  background: color-mix(in srgb, var(--rp-foreground) 25%, transparent);
}

.rp-fake-select {
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--rp-border);
  background: var(--rp-card);
}

.rp-pill {
  height: 36px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rp-foreground) 8%, transparent);
}

.rp-fake-input {
  height: 40px;
  border-radius: 8px;
  border: 1px dashed var(--rp-border);
}

.rp-sum-line {
  font-size: 13px;
}

.rp-dots {
  height: 8px;
  border-radius: 4px;
  flex: 1;
  max-width: 45%;
  background: color-mix(in srgb, var(--rp-foreground) 10%, transparent);
}

.rp-dots--short {
  max-width: 28%;
}
</style>
