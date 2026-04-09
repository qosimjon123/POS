<template>
  <div class="rp-pos-profile column items-center">
    <div class="rp-pos-profile-card column items-center">
      <div class="rp-pos-profile-avatar" aria-hidden="true">
        <q-icon name="badge" size="36px" class="rp-icon-fg" />
      </div>
      <h2 class="rp-pos-profile-name">{{ t('pos.cashier') }}</h2>
      <p class="rp-pos-profile-hint">{{ t('pos.connectionAndTime') }}</p>

      <div class="rp-pos-profile-tools row flex-center q-gutter-sm q-mt-lg">
        <LanguageSelector />
        <ThemeToggle />
        <SettingsButton />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import LanguageSelector from 'src/components/system/LanguageSelector.vue';
import SettingsButton from 'src/components/system/SettingsButton.vue';
import ThemeToggle from 'src/components/system/ThemeToggle.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.rp-pos-profile {
  flex: 1;
  min-height: 0;
  padding: 24px 16px;
  padding-bottom: max(24px, var(--rp-safe-inset-bottom));
  background: var(--rp-background);
  overflow-y: auto;
}

.rp-pos-profile-card {
  width: 100%;
  max-width: 420px;
  padding: 28px 20px;
  border-radius: var(--rp-radius-lg);
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
  box-shadow: var(--rp-shadow-sm);
}

.rp-pos-profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: var(--rp-radius-full);
  background: var(--rp-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.rp-pos-profile-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-pos-profile-hint {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--rp-muted-foreground);
  text-align: center;
}

.rp-icon-fg {
  color: var(--rp-foreground);
}

.rp-pos-profile-tools {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
