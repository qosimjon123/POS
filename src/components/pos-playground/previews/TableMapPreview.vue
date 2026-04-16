<template>
  <div class="column no-wrap q-gutter-md">
    <div class="row items-center q-gutter-sm">
      <q-btn-toggle
        v-model="zone"
        spread
        no-caps
        unelevated
        toggle-color="primary"
        :options="[
          { label: 'Зал A', value: 'a' },
          { label: 'Терасса', value: 'b' },
        ]"
      />
    </div>
    <RpWirePlaceholder label="План зала (тапы по столу)">
      <div class="rp-floor">
        <div v-for="n in 12" :key="n" class="rp-table" :class="{ 'rp-table--busy': n % 4 === 0 }">
          {{ n }}
        </div>
      </div>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Легенда" tight>
      <div class="row q-gutter-md text-caption text-grey-7">
        <span>■ Свободен</span>
        <span>■ Занят / счёт</span>
      </div>
    </RpWirePlaceholder>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';

const zone = ref('a');
</script>

<style scoped lang="scss">
.rp-floor {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.rp-table {
  aspect-ratio: 1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid var(--rp-border);
  background: color-mix(in srgb, var(--rp-success) 12%, transparent);
  color: var(--rp-foreground);
}

.rp-table--busy {
  background: color-mix(in srgb, var(--rp-primary) 15%, transparent);
  border-color: color-mix(in srgb, var(--rp-primary) 35%, var(--rp-border));
}
</style>
