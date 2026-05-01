<template>
  <div class="rp-pos-header-shell" :class="shellModifierClass">
  <header class="rp-pos-header">
    <div class="rp-pos-header__store">
      <div class="rp-pos-store-block">
        <template v-if="headerLayout === 'mobile'">
          <div class="rp-pos-store-line1 row items-center no-wrap">
            <div class="rp-pos-store-name col ellipsis">
              {{ registerHeaderTitle }}
            </div>
            <div class="rp-pos-store-status row items-center no-wrap">
              <ConnectionStatus />
              <TimeDisplay />
              <q-btn
                flat
                round
                class="rp-pos-search-toggle"
                :aria-label="
                  searchPanelOpen ? t('pos.hideSearch') : t('pos.openSearch')
                "
                :aria-expanded="searchPanelOpen"
                @click="toggleSearchPanel"
              >
                <q-icon
                  :name="searchPanelOpen ? 'expand_less' : 'search'"
                  size="28px"
                  class="rp-icon-fg"
                />
              </q-btn>
            </div>
          </div>
        </template>
        <template v-else-if="headerLayout === 'desktop-md'">
          <div class="rp-pos-store-md row items-center no-wrap">
            <div class="rp-pos-store-md-text col">
              <div class="rp-pos-store-name">
                {{ registerHeaderTitle }}
              </div>
              <div v-if="registerOpenedAtLabel" class="rp-pos-store-meta">
                {{ registerOpenedAtLabel }}
              </div>
            </div>
            <q-btn
              flat
              round
              class="rp-pos-search-toggle rp-pos-search-toggle--md"
              :aria-label="
                searchPanelOpen ? t('pos.hideSearch') : t('pos.openSearch')
              "
              :aria-expanded="searchPanelOpen"
              @click="toggleSearchPanel"
            >
              <q-icon
                :name="searchPanelOpen ? 'expand_less' : 'search'"
                size="26px"
                class="rp-icon-fg"
              />
            </q-btn>
          </div>
        </template>
        <template v-else>
          <div class="rp-pos-store-name">
            {{ registerHeaderTitle }}
          </div>
          <div v-if="registerOpenedAtLabel" class="rp-pos-store-meta">
            {{ registerOpenedAtLabel }}
          </div>
        </template>
      </div>
    </div>

    <div
      v-show="!isCollapsibleSearch || searchPanelOpen"
      class="rp-pos-header__search"
    >
      <div class="rp-pos-search-wrap">
        <q-icon name="search" size="20px" class="rp-pos-search-icon" />
        <q-input
          ref="searchInputRef"
          v-model="search"
          type="text"
          borderless
          dense
          class="rp-pos-search-input col"
          :placeholder="t('pos.searchPlaceholder')"
          :dark="$q.dark.isActive"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
        />
        <div class="rp-pos-search-actions row items-center no-wrap">
          <q-btn
            flat
            dense
            round
            class="rp-pos-icon-btn"
            :disable="!scanner.supported"
            :aria-label="t('pos.scanBarcode')"
            @click="onScanClick"
          >
            <q-icon name="qr_code_scanner" size="20px" class="rp-icon-fg" />
          </q-btn>
          <q-btn
            flat
            dense
            round
            class="rp-pos-icon-btn"
            :aria-label="t('pos.openKeyboard')"
            @click="onKeyboardClick"
          >
            <q-icon name="keyboard" size="20px" class="rp-icon-fg" />
          </q-btn>
        </div>
      </div>
    </div>

    <div
      class="rp-pos-header__tools"
      :class="{ 'rp-pos-header__tools--no-locale': !showLocaleThemeSettings }"
    >
      <div
        v-if="showLocaleThemeSettings"
        class="rp-pos-tools-left row items-center no-wrap"
      >
        <LanguageSelector />
        <ThemeToggle />
        <SettingsButton />
      </div>
      <div class="rp-pos-tools-right row items-center no-wrap">
        <template v-if="headerLayout !== 'mobile'">
          <ConnectionStatus />
          <TimeDisplay />
        </template>
        <q-btn
          v-if="showCartShortcut"
          flat
          dense
          round
          class="rp-toolbar-round"
          :aria-label="t('pos.goToCart')"
          @click="$emit('go-cart')"
        >
          <q-icon name="shopping_basket" size="20px" class="rp-icon-fg" />
        </q-btn>
        <div
          v-if="showCashierAvatar"
          class="rp-pos-avatar"
          role="img"
          :aria-label="t('pos.cashier')"
        >
          <q-icon name="person" size="20px" class="rp-icon-muted" />
        </div>
      </div>
    </div>
  </header>

  <video
    v-if="!isNative"
    ref="scanVideoRef"
    class="rp-pos-scan-video"
    :class="{ 'rp-pos-scan-video--hidden': !showHeaderScanPreview }"
    muted
    playsinline
  />

  <div
    v-if="scanner.scanning && scanner.needsVideoPreview && showHeaderScanPreview"
    class="rp-pos-scan-hud"
  >
    <q-btn
      round
      unelevated
      color="primary"
      icon="close"
      class="rp-pos-scan-stop"
      :aria-label="t('login.stopScan')"
      @click="onStopScan"
    />
  </div>
  </div>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import { useRpKeyboard } from 'src/components/common/keyboard-inject';
import ConnectionStatus from 'src/components/system/ConnectionStatus.vue';
import LanguageSelector from 'src/components/system/LanguageSelector.vue';
import SettingsButton from 'src/components/system/SettingsButton.vue';
import ThemeToggle from 'src/components/system/ThemeToggle.vue';
import TimeDisplay from 'src/components/system/TimeDisplay.vue';
import { useRegisterContextStore } from 'src/stores/register-context';
import { useScanner } from 'src/stores/scanner';
import { useTimeStore } from 'src/stores/time';

import type { PosHeaderLayout } from 'src/components/pos/pos-layout';

defineEmits<{
  'go-cart': [];
}>();

const props = withDefaults(
  defineProps<{
    headerLayout: PosHeaderLayout;
    showCartShortcut?: boolean;
    showLocaleThemeSettings?: boolean;
    showCashierAvatar?: boolean;
  }>(),
  {
    showCartShortcut: false,
    showLocaleThemeSettings: true,
    showCashierAvatar: true,
  },
);

const search = defineModel<string>('search', { required: true });

const $q = useQuasar();
const { t, locale } = useI18n();
const scanner = useScanner();
const { webPreviewVideoTarget } = scanner;
const registerContext = useRegisterContextStore();
const { selectedRegister } = storeToRefs(registerContext);
const timeStore = useTimeStore();
const kbd = useRpKeyboard();
const searchInputRef = ref<{ focus?: () => void } | null>(null);
const scanVideoRef = ref<HTMLVideoElement | null>(null);
const isNative = Capacitor.isNativePlatform();

const showHeaderScanPreview = computed(
  () =>
    webPreviewVideoTarget.value !== null &&
    scanVideoRef.value === webPreviewVideoTarget.value,
);

const shellModifierClass = computed(
  () => `rp-pos-header-shell--${props.headerLayout}`,
);

const isCollapsibleSearch = computed(
  () =>
    props.headerLayout === 'mobile' || props.headerLayout === 'desktop-md',
);

const searchPanelOpen = ref(false);

watch(
  isCollapsibleSearch,
  (collapsible) => {
    searchPanelOpen.value = !collapsible;
  },
  { immediate: true },
);

async function toggleSearchPanel() {
  searchPanelOpen.value = !searchPanelOpen.value;
  if (searchPanelOpen.value) {
    await nextTick();
    searchInputRef.value?.focus?.();
  }
}

const registerHeaderTitle = computed(() => {
  const r = selectedRegister.value;
  if (r) {
    return `${r.storeName} · ${r.name}`;
  }
  return `${t('pos.storeLabel')} · ${t('pos.registerLabel')}`;
});

const registerOpenedAtLabel = computed(() => {
  const iso = selectedRegister.value?.openedAt;
  if (!iso) return '';
  try {
    const time = new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
    return t('pos.openedAt', { time });
  } catch {
    return t('pos.openedAt', { time: iso });
  }
});

onMounted(() => {
  void scanner.init();
  timeStore.ensureTick();
});

watch(
  scanVideoRef,
  (el) => {
    scanner.setDefaultWebScanVideo(isNative ? null : el);
  },
  { immediate: true },
);

onUnmounted(() => {
  scanner.setDefaultWebScanVideo(null);
  void scanner.stopScan();
});

function onSearchFocus() {
  kbd.bindInput(
    () => search.value,
    (v) => {
      search.value = v;
    },
  );
  kbd.open();
}

function onSearchBlur() {
  kbd.close();
  kbd.resetBinding();
}

async function onScanClick() {
  const result = await scanner.startScan(scanVideoRef.value ?? null);
  if (result?.value) {
    search.value = result.value;
  }
}

function onStopScan() {
  void scanner.stopScan();
}

function onKeyboardClick() {
  searchInputRef.value?.focus?.();
  onSearchFocus();
}
</script>

<style scoped lang="scss">
.rp-pos-scan-video {
  position: fixed;
  inset: 0;
  z-index: 6999;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.rp-pos-scan-video--hidden {
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.rp-pos-scan-hud {
  position: fixed;
  inset: 0;
  z-index: 7000;
  pointer-events: none;
  background: color-mix(in srgb, #000 35%, transparent);
}

.rp-pos-scan-stop {
  position: absolute;
  top: max(16px, var(--rp-safe-inset-top));
  right: max(16px, var(--rp-safe-inset-right));
  pointer-events: auto;
}

.rp-pos-header-shell {
  flex-shrink: 0;
  width: 100%;
}

.rp-pos-header-shell :deep(.q-btn.rp-toolbar-round) {
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
}

/* Общая база шапки; сетку и отступы задаёт только модификатор оболочки (мобилка / десктоп). */
.rp-pos-header {
  display: grid;
  box-sizing: border-box;
  background: var(--rp-card);
  border-bottom: 1px solid var(--rp-border);
}

.rp-pos-store-block {
  min-width: 0;
}

.rp-pos-store-md {
  width: 100%;
  gap: 8px;
  min-width: 0;
}

.rp-pos-store-md-text {
  min-width: 0;
}

.rp-pos-store-line1 {
  width: 100%;
  gap: 10px;
  min-width: 0;
}

.rp-pos-store-status {
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
}

.rp-pos-search-toggle {
  min-width: 40px;
  min-height: 40px;
  padding: 4px;
  color: var(--rp-foreground);
}

.rp-pos-store-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--rp-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rp-pos-store-meta {
  font-size: 12px;
  color: var(--rp-muted-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* min-width: 0 + overflow — иначе поле поиска вылезает в третью колонку и накрывает язык */
.rp-pos-header__search {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.rp-pos-search-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-height: 38px;
  padding: 0 10px;
  background: var(--rp-background);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  box-sizing: border-box;
}

.rp-pos-search-icon {
  color: var(--rp-muted-foreground);
  flex-shrink: 0;
}

.rp-pos-search-input {
  min-width: 0;

  :deep(.q-field__control) {
    min-height: 36px;
  }

  :deep(.q-field__native) {
    font-size: 14px;
    color: var(--rp-foreground);
  }
}

.rp-pos-search-actions {
  gap: 4px;
  flex-shrink: 0;
}

.rp-pos-icon-btn {
  min-width: 32px;
  min-height: 32px;
  border: 1px solid color-mix(in srgb, var(--rp-foreground) 12%, transparent);
  border-radius: var(--rp-radius-sm);
}

.rp-pos-header__tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}

.rp-pos-tools-left,
.rp-pos-tools-right {
  gap: 10px;
}

.rp-icon-fg {
  color: var(--rp-foreground);
}

.rp-icon-muted {
  color: var(--rp-muted-foreground);
}

.rp-pos-avatar {
  width: 34px;
  height: 34px;
  border-radius: var(--rp-radius-full);
  background: var(--rp-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* shell: mobile */
.rp-pos-header-shell--mobile :deep(.rp-time) {
  font-size: 17px;
  font-weight: 600;
}

.rp-pos-header-shell--mobile :deep(.rp-connection .q-icon) {
  font-size: 22px !important;
}

.rp-pos-header-shell--mobile :deep(.rp-settings-card) {
  min-height: 40px;
  padding: 4px 10px 4px 4px;
  border-radius: var(--rp-radius-md);
}

.rp-pos-header-shell--mobile :deep(.rp-settings-icon) {
  width: 32px;
  height: 32px;
}

.rp-pos-header-shell--mobile :deep(.rp-settings-value) {
  font-size: 14px;
}

.rp-pos-header-shell--mobile .rp-pos-header {
  grid-template-columns: 1fr;
  align-items: stretch;
  align-content: start;
  row-gap: 12px;
  padding: 14px 16px;
  padding-top: max(14px, var(--rp-safe-inset-top));
  padding-left: max(16px, var(--rp-safe-inset-left));
  padding-right: max(16px, var(--rp-safe-inset-right));
  min-height: 64px;
}

.rp-pos-header-shell--mobile .rp-pos-store-line1 {
  gap: 12px;
  min-height: 44px;
  align-items: center;
}

.rp-pos-header-shell--mobile .rp-pos-store-name {
  font-size: 16px;
  line-height: 1.25;
}

.rp-pos-header-shell--mobile .rp-pos-store-meta {
  font-size: 13px;
  margin-top: 4px;
}

.rp-pos-header-shell--mobile .rp-pos-store-status {
  gap: 10px;
}

.rp-pos-header-shell--mobile .rp-pos-search-toggle {
  min-width: 44px;
  min-height: 44px;
  padding: 6px;
}

.rp-pos-header-shell--mobile .rp-pos-search-wrap {
  min-height: 44px;
  padding: 0 12px;
}

.rp-pos-header-shell--mobile .rp-pos-search-input :deep(.q-field__control) {
  min-height: 40px;
}

.rp-pos-header-shell--mobile .rp-pos-search-input :deep(.q-field__native) {
  font-size: 15px;
}

.rp-pos-header-shell--mobile .rp-pos-header__tools {
  justify-content: space-between;
}

.rp-pos-header-shell--mobile .rp-pos-tools-left {
  flex: 1;
  justify-content: flex-start;
}

.rp-pos-header-shell--mobile .rp-pos-tools-right {
  flex: 1;
  justify-content: flex-end;
}

.rp-pos-header-shell--mobile .rp-pos-header__tools--no-locale {
  justify-content: flex-end;
}

.rp-pos-header-shell--mobile .rp-pos-header__tools--no-locale .rp-pos-tools-right {
  flex: 0 1 auto;
}

/* shell: desktop-md + desktop-wide */
.rp-pos-header-shell--desktop-md,
.rp-pos-header-shell--desktop-wide {
  :deep(.rp-time) {
    font-size: 15px;
    font-weight: 500;
  }

  :deep(.rp-connection .q-icon) {
    font-size: 20px !important;
  }

  :deep(.rp-settings-card) {
    min-height: 36px;
    padding: 2px 8px 2px 2px;
    border-radius: var(--rp-radius-md);
  }

  :deep(.rp-settings-icon) {
    width: 28px;
    height: 28px;
  }

  :deep(.rp-settings-value) {
    font-size: 13px;
  }

  .rp-pos-header__tools {
    flex-wrap: nowrap;
    gap: 8px;
    justify-content: flex-end;
    min-width: 0;
  }

  .rp-pos-tools-left,
  .rp-pos-tools-right {
    gap: 6px;
  }

  .rp-pos-tools-left {
    flex: 0 0 auto;
  }

  .rp-pos-tools-right {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    min-width: 0;
  }

}

/* Узкий десктоп (breakpoint md): две строки — магазин+тулбар, поиск на всю ширину */
.rp-pos-header-shell--desktop-md .rp-pos-header {
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  row-gap: 10px;
  column-gap: 14px;
  align-items: center;
  align-content: start;
  padding: 9px 14px;
  padding-top: max(9px, var(--rp-safe-inset-top));
  padding-left: max(14px, var(--rp-safe-inset-left));
  padding-right: max(14px, var(--rp-safe-inset-right));
  min-height: 52px;
  isolation: isolate;
}

.rp-pos-header-shell--desktop-md .rp-pos-header__store {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
}

.rp-pos-header-shell--desktop-md .rp-pos-header__search {
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;
  z-index: 1;
  min-width: 0;
  max-width: none;
  overflow: visible;
}

.rp-pos-header-shell--desktop-md .rp-pos-header__tools {
  grid-column: 2;
  grid-row: 1;
  justify-self: end;
  align-self: center;
  position: relative;
  z-index: 2;
  overflow-x: clip;
}

/* Широкий десктоп (lg+): одна строка, три колонки */
.rp-pos-header-shell--desktop-wide .rp-pos-header {
  grid-template-columns: minmax(160px, 1fr) minmax(220px, 2fr) minmax(360px, 1.25fr);
  grid-template-rows: auto;
  column-gap: 18px;
  align-items: center;
  padding: 9px 14px;
  padding-top: max(9px, var(--rp-safe-inset-top));
  padding-left: max(14px, var(--rp-safe-inset-left));
  padding-right: max(14px, var(--rp-safe-inset-right));
  min-height: 52px;
  isolation: isolate;
}

.rp-pos-header-shell--desktop-wide .rp-pos-header__store,
.rp-pos-header-shell--desktop-wide .rp-pos-header__search,
.rp-pos-header-shell--desktop-wide .rp-pos-header__tools {
  grid-column: auto;
  grid-row: auto;
}

.rp-pos-header-shell--desktop-wide .rp-pos-header__search {
  position: relative;
  z-index: 1;
}

.rp-pos-header-shell--desktop-wide .rp-pos-header__tools {
  position: relative;
  z-index: 2;
  overflow-x: clip;
}
</style>
