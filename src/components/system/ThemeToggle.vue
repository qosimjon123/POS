<template>
  <q-btn
    round
    flat
    dense
    padding="sm"
    class="rp-toolbar-round"
    :aria-label="ariaLabel"
    @click="themeStore.toggle()"
  >
    <q-icon :name="iconName" size="18px" class="rp-icon-fg" />
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useThemeStore } from 'src/stores/theme';

const { t } = useI18n();
const themeStore = useThemeStore();
const { dark } = storeToRefs(themeStore);

const iconName = computed(() => (dark.value ? 'light_mode' : 'dark_mode'));

const ariaLabel = computed(() =>
  dark.value ? t('system.useLightTheme') : t('system.useDarkTheme'),
);
</script>

<style scoped lang="scss">
.rp-icon-fg {
  color: var(--rp-foreground);
}
</style>
