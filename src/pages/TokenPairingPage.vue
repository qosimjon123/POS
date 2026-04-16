<template>
  <q-page class="rp-token-pairing-page column no-wrap">
    <header class="rp-token-pairing-toolbar row items-center no-wrap">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        :aria-label="t('tokenPairing.backHome')"
        to="/"
      />
      <h1 class="rp-token-pairing-toolbar__title">{{ t('tokenPairing.pageTitle') }}</h1>
    </header>

    <main class="rp-token-pairing-main col flex flex-center">
      <RpKeyboard type="full" position="floating">
        <TokenPairingLoginMethod />
      </RpKeyboard>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RpKeyboard from 'src/components/common/RpKeyboard.vue';
import TokenPairingLoginMethod from 'src/components/login/TokenPairingLoginMethod.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.rp-token-pairing-page {
  min-height: 100%;
  background: var(--rp-background);
  color: var(--rp-foreground);
}

.rp-token-pairing-toolbar {
  flex-shrink: 0;
  padding: max(12px, var(--rp-safe-inset-top)) max(16px, var(--rp-safe-inset-right)) 12px
    max(16px, var(--rp-safe-inset-left));
  gap: 8px;
  border-bottom: 1px solid var(--rp-border);
}

.rp-token-pairing-toolbar__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
}

.rp-token-pairing-main {
  min-height: 0;
  padding: 16px max(16px, var(--rp-safe-inset-right)) max(24px, var(--rp-safe-inset-bottom))
    max(16px, var(--rp-safe-inset-left));
  box-sizing: border-box;
}
</style>
