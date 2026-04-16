<template>
  <div class="column no-wrap q-gutter-md">
    <q-list bordered separator class="rounded-borders">
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="language" color="grey-7" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Язык интерфейса</q-item-label>
          <q-item-label caption>Русский</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="grey-5" />
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="print" color="grey-7" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Принтер чека</q-item-label>
          <q-item-label caption>QZ Tray · не выбран</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="grey-5" />
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="cast" color="grey-7" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Дисплей покупателя</q-item-label>
          <q-item-label caption>URL второго экрана</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="grey-5" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="offline_pin" color="grey-7" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Ручной офлайн</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle :model-value="false" disable />
        </q-item-section>
      </q-item>
    </q-list>
    <div class="text-caption text-grey-7 q-px-sm">
      Настройки не сохраняются — макет структуры экрана.
    </div>
  </div>
</template>

<script setup lang="ts"></script>
