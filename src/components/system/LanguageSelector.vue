<template>
  <q-btn-dropdown
    flat
    dense
    no-caps
    padding="sm"
    class="rp-settings-card"
    dropdown-icon="expand_more"
    :dark="$q.dark.isActive"
    content-class="rp-lang-menu-popup"
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
        :active="localeStore.locale === opt.value"
        role="option"
        :aria-selected="localeStore.locale === opt.value"
        @click="localeStore.setLocale(opt.value)"
      >
        <q-item-section class="text-right">{{ opt.label }}</q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { SUPPORTED_LOCALES } from 'src/i18n';
import { useLocaleStore } from 'src/stores/locale';

const { t } = useI18n({ useScope: 'global' });
const localeStore = useLocaleStore();

const localeOptions = SUPPORTED_LOCALES;

const currentShort = computed(() =>
  localeStore.locale === 'tg-TJ' ? 'TJ' : 'RU',
);
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

<!-- QMenu рендерится в телепорте на body — scoped :deep не всегда попадает в popup -->
<style lang="scss">
.rp-lang-menu-popup.q-menu {
  background: var(--rp-card) !important;
  border: 1px solid var(--rp-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  padding: 4px 0;
}

.rp-lang-menu-popup .q-item {
  color: var(--rp-foreground);
  min-height: 40px;
}

.rp-lang-menu-popup .q-item--active {
  background: var(--rp-secondary);
  color: var(--rp-foreground);
}

.rp-lang-menu-popup .q-item:hover,
.rp-lang-menu-popup .q-item:focus-visible {
  background: var(--rp-secondary);
}

.rp-lang-menu-popup .q-focus-helper {
  background: currentColor;
  opacity: 0.08;
}
</style>
