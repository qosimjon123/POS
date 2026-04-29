<template>
  <header class="rp-app-chrome-toolbar row items-center justify-between">
    <div class="row items-center rp-app-chrome-toolbar__group">
      <LanguageSelector />
      <ThemeToggle />
      <SettingsButton />
    </div>
    <div class="row items-center rp-app-chrome-toolbar__group">
      <ConnectionStatus />
      <TimeDisplay />
    </div>
  </header>
</template>

<script setup lang="ts">
import ConnectionStatus from 'src/components/system/ConnectionStatus.vue';
import LanguageSelector from 'src/components/system/LanguageSelector.vue';
import SettingsButton from 'src/components/system/SettingsButton.vue';
import ThemeToggle from 'src/components/system/ThemeToggle.vue';
import TimeDisplay from 'src/components/system/TimeDisplay.vue';
</script>

<style scoped lang="scss">
.rp-app-chrome-toolbar {
  box-sizing: border-box;
  width: 100%;
  flex-shrink: 0;
  padding-top: max(24px, var(--rp-safe-inset-top));
  padding-right: max(48px, var(--rp-safe-inset-right));
  padding-bottom: 24px;
  padding-left: max(48px, var(--rp-safe-inset-left));
}

.rp-app-chrome-toolbar__group {
  gap: 12px;
}

@media (max-width: 599px) {
  .rp-app-chrome-toolbar {
    padding-top: max(16px, var(--rp-safe-inset-top));
    padding-right: max(16px, var(--rp-safe-inset-right));
    padding-bottom: 16px;
    padding-left: max(16px, var(--rp-safe-inset-left));
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
