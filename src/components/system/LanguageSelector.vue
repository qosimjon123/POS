<template>
  <q-btn-dropdown
    flat
    dense
    no-caps
    padding="sm"
    class="rp-settings-card"
    dropdown-icon="expand_more"
    :aria-label="t('system.languageMenu')"
  >
    <template #label>
      <div class="rp-settings-card__inner row items-center no-wrap">
        <div class="rp-settings-icon">
          <q-icon name="translate" size="20px" class="rp-icon-fg" />
        </div>
        <span class="rp-settings-value">{{ currentShort }}</span>
      </div>
    </template>

    <q-list dense padding class="rp-lang-menu" role="listbox">
      <q-item
        v-for="opt in localeOptions"
        :key="opt.value"
        v-close-popup
        clickable
        :active="locale === opt.value"
        role="option"
        :aria-selected="locale === opt.value"
        @click="setLocale(opt.value)"
      >
        <q-item-section class="text-right">{{ opt.label }}</q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MessageLanguages } from 'src/boot/i18n';

const { locale, t } = useI18n();

const localeOptions: { value: MessageLanguages; label: string }[] = [
  { value: 'ru-RU', label: 'RU' },
  { value: 'tg-TJ', label: 'TJ' },
];

const currentShort = computed(() =>
  locale.value === 'tg-TJ' ? 'TJ' : 'RU',
);

function setLocale(code: MessageLanguages) {
  locale.value = code;
}
</script>

<style scoped lang="scss">
.rp-settings-card {
  min-height: 48px;
  border-radius: 12px;
  padding: 6px 12px 6px 6px;
  background: var(--rp-card);
}

.rp-settings-card :deep(.q-btn-dropdown__arrow-container) {
  margin-left: 4px;
}

.rp-settings-card__inner {
  gap: 8px;
}

.rp-settings-icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--rp-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rp-settings-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-icon-fg {
  color: var(--rp-foreground);
}

.rp-lang-menu {
  min-width: 20px;
}

.rp-lang-menu :deep(.q-item__section) {
  text-align: center;
}
</style>
