<template>
  <div class="column no-wrap q-gutter-md">
    <div class="row items-center q-gutter-sm">
      <q-badge color="warning" label="Офлайн" />
      <q-badge outline color="grey" label="В очереди: 3" />
    </div>
    <RpWirePlaceholder label="Очередь синхронизации">
      <q-list bordered separator class="rounded-borders bg-card">
        <q-item v-for="n in 3" :key="n">
          <q-item-section>
            <q-item-label>Чек #OFF-{{100 + n }}</q-item-label>
            <q-item-label caption>Ожидает отправки</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-spinner-dots size="24px" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
    </RpWirePlaceholder>
    <RpWirePlaceholder label="Последняя ошибка · повтор" tight>
      <div class="rp-error-box text-caption">
        Пример: таймаут API — кнопка «Повторить» / «Сбросить локально» (по политике).
      </div>
    </RpWirePlaceholder>
    <div class="row q-gutter-sm">
      <q-btn outline class="col" no-caps color="primary" label="Синхронизировать" disable />
      <q-btn flat class="col" no-caps label="Отчёт здоровья" disable />
    </div>
  </div>
</template>

<script setup lang="ts">
import RpWirePlaceholder from 'src/components/pos-playground/wire/RpWirePlaceholder.vue';
</script>

<style scoped lang="scss">
.bg-card {
  background: var(--rp-card);
}

.rp-error-box {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--rp-negative) 35%, var(--rp-border));
  background: color-mix(in srgb, var(--rp-negative) 8%, transparent);
  color: var(--rp-foreground);
}
</style>
