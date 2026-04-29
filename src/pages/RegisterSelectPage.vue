<template>
  <q-page class="rp-register-select-page column no-wrap">
    <AppChromeToolbar />

    <main class="rp-register-main col">
      <div class="rp-register-inner column">
        <div class="rp-register-head q-mb-lg">
          <h1 class="rp-register-title">{{ t('registers.pageTitle') }}</h1>
          <p class="rp-register-subtitle">{{ t('registers.subtitle') }}</p>
        </div>

        <q-list
          bordered
          separator
          class="rp-register-list rounded-borders"
          :aria-label="t('registers.pageTitle')"
        >
          <q-item
            v-for="item in registerStore.availableRegisters"
            :key="item.id"
            v-ripple="item.available"
            :clickable="item.available"
            class="rp-register-item"
            :class="{ 'rp-register-item--unavailable': !item.available }"
            @click="onSelect(item)"
          >
            <q-item-section avatar>
              <template v-if="item.available">
                <q-avatar
                  rounded
                  :color="themeStore.dark ? 'grey-9' : 'grey-3'"
                  text-color="primary"
                  icon="point_of_sale"
                />
              </template>
              <template v-else>
                <q-avatar
                  rounded
                  class="rp-register-avatar-lock"
                  icon="lock"
                />
              </template>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
              <q-item-label caption class="rp-register-store">{{ item.storeName }}</q-item-label>

              <div v-if="item.available" class="rp-register-meta q-mt-xs">
                <span
                  class="rp-register-status"
                  :class="
                    item.isOpen
                      ? 'rp-register-status--open'
                      : 'rp-register-status--closed'
                  "
                >
                  {{
                    item.isOpen
                      ? t('registers.statusOpen')
                      : t('registers.statusClosed')
                  }}
                </span>
                <span
                  v-if="item.isOpen && item.openedAt"
                  class="rp-register-opened"
                >
                  {{ t('registers.openedAt') }} · {{ formatOpened(item.openedAt) }}
                </span>
              </div>

              <q-item-label
                v-if="item.hint && item.available"
                caption
                class="q-mt-xs rp-register-hint"
              >
                {{ item.hint }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                v-if="item.available"
                name="chevron_right"
                class="rp-icon-muted"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <p v-if="registerStore.availableRegisters.length === 0" class="rp-register-empty q-mt-lg">
          {{ t('registers.empty') }}
        </p>

        <q-btn
          flat
          no-caps
          color="primary"
          class="q-mt-xl self-start"
          :label="t('registers.backToLogin')"
          icon="arrow_back"
          :to="{ path: '/' }"
        />
      </div>
    </main>

    <RegisterOpenDialog
      v-model="openRegisterDialog"
      :register="pendingRegister"
      @confirm="onConfirmOpenRegister"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import RegisterOpenDialog from 'src/components/register/RegisterOpenDialog.vue';
import AppChromeToolbar from 'src/components/system/AppChromeToolbar.vue';
import type { PosRegister } from 'src/stores/register-context';
import { useRegisterContextStore } from 'src/stores/register-context';
import { useThemeStore } from 'src/stores/theme';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const registerStore = useRegisterContextStore();
const themeStore = useThemeStore();

const openRegisterDialog = ref(false);
const pendingRegister = ref<PosRegister | null>(null);

function formatOpened(iso: string) {
  try {
    return new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function onSelect(item: PosRegister) {
  if (!item.available) {
    return;
  }
  if (item.isOpen) {
    registerStore.selectRegister(item);
    void router.push(registerRedirectTarget());
    return;
  }
  pendingRegister.value = item;
  openRegisterDialog.value = true;
}

function onConfirmOpenRegister() {
  if (!pendingRegister.value) return;
  registerStore.confirmRegisterOpened(pendingRegister.value.id);
  const reg = registerStore.availableRegisters.find(
    (r) => r.id === pendingRegister.value!.id,
  );
  if (reg) {
    registerStore.selectRegister(reg);
  }
  openRegisterDialog.value = false;
  pendingRegister.value = null;
  void router.push(registerRedirectTarget());
}

function registerRedirectTarget() {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' && redirect.startsWith('/')
    ? redirect
    : { name: 'pos' };
}
</script>

<style scoped lang="scss">
.rp-register-select-page {
  min-height: 100%;
  background: var(--rp-background);
  color: var(--rp-foreground);
}

.rp-register-main {
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: max(48px, var(--rp-safe-inset-right));
  padding-bottom: max(48px, var(--rp-safe-inset-bottom));
  padding-left: max(48px, var(--rp-safe-inset-left));
}

.rp-register-inner {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.rp-register-title {
  margin: 0;
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 700;
  color: var(--rp-foreground);
  line-height: 1.25;
}

.rp-register-subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--rp-muted-foreground);
  line-height: 1.45;
}

.rp-register-list {
  background: var(--rp-card);
  border: 1px solid var(--rp-border);
}

.rp-register-item {
  min-height: 72px;
}

.rp-register-item--unavailable {
  opacity: 0.58;
  background: color-mix(in srgb, var(--rp-foreground) 6%, var(--rp-card)) !important;
  pointer-events: none;
}

.rp-register-avatar-lock {
  background: color-mix(in srgb, var(--rp-foreground) 10%, transparent) !important;
  color: var(--rp-muted-foreground) !important;
}

.rp-register-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rp-register-status {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.rp-register-status--open {
  color: var(--rp-success-foreground);
}

.rp-register-status--closed {
  color: var(--rp-muted-foreground);
}

.rp-register-opened {
  font-size: 12px;
  color: var(--rp-muted-foreground);
  line-height: 1.3;
}

.rp-register-store {
  color: var(--rp-muted-foreground) !important;
}

.rp-register-hint {
  color: var(--rp-muted-foreground) !important;
  font-size: 12px;
}

.rp-register-empty {
  text-align: center;
  color: var(--rp-muted-foreground);
  margin: 0;
}

.rp-icon-muted {
  color: var(--rp-muted-foreground);
}

@media (max-width: 599px) {
  .rp-register-toolbar {
    padding-top: max(16px, var(--rp-safe-inset-top));
    padding-right: max(16px, var(--rp-safe-inset-right));
    padding-bottom: 16px;
    padding-left: max(16px, var(--rp-safe-inset-left));
    flex-wrap: wrap;
    gap: 12px;
  }

  .rp-register-main {
    padding-right: max(16px, var(--rp-safe-inset-right));
    padding-left: max(16px, var(--rp-safe-inset-left));
  }
}
</style>
