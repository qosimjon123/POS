<template>
  <section class="rp-qr-section" aria-labelledby="qr-login-heading">
    <div class="rp-two-col">
      <div class="rp-col-left">
        <div class="rp-scanner-status">
          <div class="rp-scanner-icon">
            <q-icon name="qr_code_2" size="32px" class="rp-icon-fg" />
            <span
              class="rp-status-dot"
              :class="scannerReady ? 'rp-status-dot--ok' : 'rp-status-dot--bad'"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 id="qr-login-heading" class="rp-scanner-title">
              {{ t('login.scannerReady') }}
            </h2>
            <p class="rp-scanner-desc">{{ t('login.scannerHint') }}</p>
          </div>
        </div>

        <div class="rp-hint-row row no-wrap items-start">
          <q-icon
            name="verified_user"
            size="24px"
            class="rp-hint-icon q-mt-xs"
          />
          <span>{{ t('login.shieldHint') }}</span>
        </div>
      </div>

      <div class="rp-pin-card column">
        <div class="rp-pin-head">
          <div class="rp-pin-title-wrap">
            <p class="rp-pin-title">{{ t('login.pinLockedTitle') }}</p>
          </div>
          <div class="rp-lock-badge flex flex-center">
            <q-icon name="lock" size="24px" class="rp-icon-muted" />
          </div>
        </div>

        <div class="rp-pin-dots row justify-center">
          <span
            v-for="i in 4"
            :key="i"
            class="rp-pin-dot"
            :class="{
              'rp-pin-dot--filled': scanned && pin.length >= i,
            }"
          />
        </div>

        <div
          class="rp-numpad"
          :class="{ 'rp-numpad--disabled': !scanned }"
        >
          <button
            v-for="n in numKeys"
            :key="n.key"
            type="button"
            class="rp-num-btn"
            :class="{
              'rp-num-btn--empty': n.key === 'empty',
              'rp-num-btn--action': n.key === 'back',
            }"
            :disabled="!scanned || n.key === 'empty'"
            @click="onNumKey(n.key)"
          >
            <template v-if="n.key === 'back'">
              <q-icon name="backspace" size="28px" class="rp-icon-fg" />
            </template>
            <template v-else-if="n.key !== 'empty'">{{ n.label }}</template>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/** Replace with real scanner / session state when integrating hardware or API. */
const scanned = ref(false);
const scannerReady = ref(true);

const pin = ref('');

const numKeys = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6', label: '6' },
  { key: '7', label: '7' },
  { key: '8', label: '8' },
  { key: '9', label: '9' },
  { key: 'empty', label: '' },
  { key: '0', label: '0' },
  { key: 'back', label: '' },
] as const;

function onNumKey(key: string) {
  if (!scanned.value) return;
  if (key === 'back') {
    pin.value = pin.value.slice(0, -1);
    return;
  }
  if (pin.value.length >= 4) return;
  pin.value += key;
}
</script>

<style scoped lang="scss">
.rp-qr-section {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.rp-two-col {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  column-gap: 45px;
  align-items: stretch;
}

.rp-col-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  gap: 16px;
}

@media (max-width: 1023px) {
  .rp-two-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .rp-col-left {
    display: contents;
  }

  .rp-scanner-status {
    order: 1;
  }

  .rp-pin-card {
    order: 2;
  }

  .rp-hint-row {
    order: 3;
  }
}

.rp-scanner-status {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  background: var(--rp-secondary);
  border-radius: 12px;
  padding: 38px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 23px;
}

.rp-scanner-icon {
  width: 62px;
  height: 62px;
  background: var(--rp-card);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.rp-status-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid var(--rp-secondary);
}

.rp-status-dot--ok {
  background: var(--rp-success);
}

.rp-status-dot--bad {
  background: var(--rp-negative);
}

.rp-scanner-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--rp-foreground);
  line-height: 1.2;
}

.rp-scanner-desc {
  margin: 0;
  font-size: 16px;
  color: var(--rp-secondary-foreground);
  line-height: 1.5;
}

.rp-hint-row {
  flex-shrink: 0;
  min-width: 0;
  gap: 15px;
  color: var(--rp-muted-foreground);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  background: var(--rp-card);
  padding: 24px;
  border-radius: 12px;
  width: 100%;
}

.rp-hint-icon {
  color: var(--rp-success-foreground);
  flex-shrink: 0;
}

.rp-pin-card {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  background: var(--rp-muted);
  border-radius: 12px;
  padding: 46px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.rp-pin-head {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 38px;
  min-width: 0;
}

.rp-pin-title-wrap {
  flex: 1 1 0;
  min-width: 0;
}

.rp-pin-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--rp-foreground);
  margin: 0;
  line-height: 1.35;
  overflow-wrap: anywhere;
  hyphens: auto;
}

.rp-lock-badge {
  flex-shrink: 0;
  width: 46px;
  min-width: 46px;
  height: 46px;
  border-radius: 23px;
  background: var(--rp-card);
}

.rp-pin-dots {
  flex-wrap: wrap;
  gap: clamp(12px, 4vw, 30px);
  margin-bottom: 42px;
  opacity: 0.55;
}

.rp-pin-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--rp-muted-foreground);
  background: transparent;
}

.rp-pin-dot--filled {
  background: var(--rp-foreground);
  border-color: var(--rp-foreground);
}

.rp-numpad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  max-width: 100%;
  gap: clamp(10px, 3vw, 21px) clamp(10px, 4vw, 30px);
  justify-items: center;
  justify-content: center;
  margin-top: auto;
  box-sizing: border-box;
}

.rp-numpad--disabled {
  opacity: 0.42;
  pointer-events: none;
}

.rp-num-btn {
  box-sizing: border-box;
  width: 100%;
  max-width: 85px;
  aspect-ratio: 1;
  height: auto;
  border-radius: 50%;
  border: none;
  background: var(--rp-secondary);
  color: var(--rp-foreground);
  font-size: clamp(22px, 7vw, 34px);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rp-num-btn:disabled {
  cursor: default;
}

.rp-num-btn--empty {
  background: transparent;
}

.rp-num-btn--action {
  background: transparent;
}

.rp-icon-fg {
  color: var(--rp-foreground);
}

.rp-icon-muted {
  color: var(--rp-muted-foreground);
}

@media (max-width: 480px) {
  .rp-pin-card {
    padding: 24px 16px;
  }

  .rp-pin-head {
    margin-bottom: 28px;
  }
}
</style>
