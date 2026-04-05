<template>
  <q-btn
    round
    flat
    dense
    padding="sm"
    class="rp-theme-circle"
    :aria-label="themeStore.dark ? t('system.useLightTheme') : t('system.useDarkTheme')"
    @click="themeStore.toggle()"
  >
    <q-icon
      :name="themeStore.dark ? 'light_mode' : 'dark_mode'"
      size="18px"
      class="rp-icon-fg"
    />
  </q-btn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useThemeStore } from 'src/stores/theme';

const { t } = useI18n();
const themeStore = useThemeStore();
</script>

<style scoped lang="scss">
.rp-theme-circle {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: var(--rp-card);
}

.rp-icon-fg {
  color: var(--rp-foreground);
}
</style>
