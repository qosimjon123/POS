<template>
  <q-page class="rp-login-page column no-wrap">
    <header class="rp-login-toolbar row items-center justify-between">
      <div class="row items-center rp-toolbar-gap">
        <LanguageSelector />
        <ThemeToggle />
        <SettingsButton />
      </div>
      <div class="row items-center rp-toolbar-gap">
        <ConnectionStatus />
        <TimeDisplay />
      </div>
    </header>

    <main class="rp-login-main col flex flex-center">
      <div class="rp-login-wrap column">
        <div
          class="rp-mode-switcher row"
          role="tablist"
          :aria-label="t('login.modeSwitchLabel')"
        >
          <button
            type="button"
            class="rp-mode-tab col"
            :class="{ 'rp-mode-tab--active': loginMode === 'qr' }"
            role="tab"
            :aria-selected="loginMode === 'qr'"
            :tabindex="loginMode === 'qr' ? 0 : -1"
            @click="loginMode = 'qr'"
          >
            {{ t('login.modeQr') }}
          </button>
          <button
            type="button"
            class="rp-mode-tab col"
            :class="{ 'rp-mode-tab--active': loginMode === 'email' }"
            role="tab"
            :aria-selected="loginMode === 'email'"
            :tabindex="loginMode === 'email' ? 0 : -1"
            @click="loginMode = 'email'"
          >
            {{ t('login.modeEmail') }}
          </button>
        </div>

        <div class="rp-login-panel" role="tabpanel">
          <QrLoginMethod v-if="loginMode === 'qr'" />
          <EmailPasswordLoginMethod v-else />
        </div>
      </div>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ConnectionStatus from 'src/components/system/ConnectionStatus.vue';
import LanguageSelector from 'src/components/system/LanguageSelector.vue';
import SettingsButton from 'src/components/system/SettingsButton.vue';
import ThemeToggle from 'src/components/system/ThemeToggle.vue';
import TimeDisplay from 'src/components/system/TimeDisplay.vue';
import EmailPasswordLoginMethod from 'src/components/login/EmailPasswordLoginMethod.vue';
import QrLoginMethod from 'src/components/login/QrLoginMethod.vue';

const { t } = useI18n();

const loginMode = ref<'qr' | 'email'>('qr');
</script>

<style scoped lang="scss">
.rp-login-page {
  min-height: 100%;
  background: var(--rp-background);
  color: var(--rp-foreground);
}

.rp-login-toolbar {
  padding: 24px 48px;
  width: 100%;
}

.rp-toolbar-gap {
  gap: 12px;
}

.rp-login-main {
  padding: 10px 48px 80px;
}

.rp-login-wrap {
  width: 100%;
  max-width: 1020px;
  gap: 34px;
}

.rp-mode-switcher {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: var(--rp-secondary);
  border-radius: 12px;
  padding: 6px;
  gap: 6px;
}

.rp-mode-tab {
  min-height: 46px;
  border: none;
  border-radius: 8px;
  padding: 0 22px;
  font-size: 15px;
  font-weight: 500;
  color: var(--rp-muted-foreground);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
}

.rp-mode-tab--active {
  background: var(--rp-card);
  color: var(--rp-foreground);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.rp-mode-tab:focus-visible {
  outline: 2px solid var(--rp-foreground);
  outline-offset: 2px;
}

.rp-login-panel {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

@media (max-width: 599px) {
  .rp-login-toolbar {
    padding: 16px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .rp-login-main {
    padding: 16px 16px 48px;
  }
}
</style>
