<template>
  <q-page class="rp-login-page column no-wrap">
    <AppChromeToolbar />

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
            :class="{ 'rp-mode-tab--active': login.mode === 'qr' }"
            role="tab"
            :aria-selected="login.mode === 'qr'"
            :tabindex="login.mode === 'qr' ? 0 : -1"
            @click="login.setMode('qr')"
          >
            {{ t('login.modeQr') }}
          </button>
          <button
            type="button"
            class="rp-mode-tab col"
            :class="{ 'rp-mode-tab--active': login.mode === 'email' }"
            role="tab"
            :aria-selected="login.mode === 'email'"
            :tabindex="login.mode === 'email' ? 0 : -1"
            @click="login.setMode('email')"
          >
            {{ t('login.modeEmail') }}
          </button>
        </div>

        <div class="rp-login-panel" role="tabpanel">
          <QrLoginMethod v-if="login.mode === 'qr'" />
          <RpKeyboard v-else type="full" position="floating">
            <EmailPasswordLoginMethod />
          </RpKeyboard>
        </div>
      </div>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AppChromeToolbar from 'src/components/system/AppChromeToolbar.vue';
import RpKeyboard from 'src/components/common/RpKeyboard.vue';
import EmailPasswordLoginMethod from 'src/components/login/EmailPasswordLoginMethod.vue';
import QrLoginMethod from 'src/components/login/QrLoginMethod.vue';
import { useLoginStore } from 'src/stores/login';

const { t } = useI18n();

const login = useLoginStore();
</script>

<style scoped lang="scss">
.rp-login-page {
  min-height: 100%;
  background: var(--rp-background);
  color: var(--rp-foreground);
}

.rp-login-main {
  box-sizing: border-box;
  padding-top: 10px;
  padding-right: max(48px, var(--rp-safe-inset-right));
  padding-bottom: max(80px, var(--rp-safe-inset-bottom));
  padding-left: max(48px, var(--rp-safe-inset-left));
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
  .rp-login-main {
    padding-top: 16px;
    padding-right: max(16px, var(--rp-safe-inset-right));
    padding-bottom: max(48px, var(--rp-safe-inset-bottom));
    padding-left: max(16px, var(--rp-safe-inset-left));
  }
}
</style>
