<template>
  <div class="rp-keyboard-supply">
    <slot />

    <template v-if="showEmbeddedPanel">
      <div class="rp-vk-embedded">
        <div class="rp-simple-keyboard-panel rp-simple-keyboard-panel--embedded">
          <SimpleKeyboard
            :key="layoutKey"
            :layout="layoutMode"
            :model-value="syncBuffer"
            embedded
            @update:model-value="onKeyboardInput"
          />
        </div>
      </div>
    </template>

    <Teleport v-else-if="showFloatingShell" to="body">
      <div
        v-if="showToggle"
        ref="toggleDockRef"
        class="rp-kb-toggle-dock"
        :class="{ 'rp-kb-toggle-dock--dragging': toggleDragging }"
        :style="toggleDockStyle"
      >
        <div
          v-if="draggable"
          class="rp-kb-toggle-drag row items-center justify-center"
          :aria-label="t('login.keyboardDragHint')"
          @pointerdown="onToggleDragStart"
        >
          <q-icon name="drag_indicator" size="20px" class="rp-kb-toggle-drag-icon" />
        </div>
        <div v-else class="rp-kb-toggle-spacer" />
        <q-btn
          flat
          no-caps
          dense
          padding="xs 14px"
          class="rp-kb-toggle-btn"
          :icon="visible ? 'keyboard_hide' : 'keyboard'"
          size="lg"
          :aria-expanded="visible"
          @click="toggleVisible"
        />
      </div>

      <div
        v-if="visible"
        ref="keyboardPanelRef"
        class="rp-simple-keyboard-panel"
        :class="{ 'rp-simple-keyboard-panel--dragging': keyboardDragging }"
        :style="keyboardPanelStyle"
      >
        <div
          class="rp-simple-keyboard-toolbar row items-center no-wrap"
          :class="{ 'rp-simple-keyboard-toolbar--dragging': keyboardDragging }"
        >
          <div
            v-if="draggable"
            class="rp-simple-keyboard-drag col row items-center"
            :aria-label="t('login.keyboardDragHint')"
            role="button"
            tabindex="0"
            @pointerdown="onKeyboardDragStart"
          >
            <q-icon name="drag_indicator" size="22px" class="rp-kb-drag-icon" />
            <span class="rp-kb-drag-label text-caption ellipsis">{{ t('login.keyboardDragHint') }}</span>
          </div>
          <div v-else class="rp-simple-keyboard-drag-spacer col" />
          <q-btn
            flat
            dense
            round
            icon="keyboard_hide"
            :aria-label="t('login.closeKeyboard')"
            class="shrink-0"
            @click="close"
          />
        </div>
        <SimpleKeyboard
          :key="layoutKey"
          :layout="layoutMode"
          :model-value="syncBuffer"
          @update:model-value="onKeyboardInput"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue';
import { LocalStorage } from 'quasar';
import { useI18n } from 'vue-i18n';

import SimpleKeyboard from 'src/components/common/SimpleKeyboard.vue';
import { RP_KEYBOARD_KEY, type RpKeyboardApi } from 'src/components/common/keyboard-inject';
import type {
  KeyboardLayoutMode,
  KeyboardPosition,
  KeyboardTypeProp,
} from 'src/components/common/keyboard-types';
import { STORAGE_KEYS } from 'src/config/storage';
import { shouldUseVirtualKeyboard } from 'src/utils/virtualKeyboard';

const KB_PANEL_POS_KEY = STORAGE_KEYS.KEYBOARD_PANEL_POS;
const KB_TOGGLE_POS_KEY = STORAGE_KEYS.KEYBOARD_TOGGLE_POS;

type KbPos = { left: number; top: number };

function isKbPos(v: unknown): v is KbPos {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as KbPos).left === 'number' &&
    typeof (v as KbPos).top === 'number'
  );
}

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    /** Full QWERTY or numeric pad. */
    type?: KeyboardTypeProp;
    /** Floating draggable panel or inline block. */
    position?: KeyboardPosition;
    draggable?: boolean;
    showToggle?: boolean;
    /** When true, show on-screen keyboard even on native (Capacitor) builds. */
    forceVirtual?: boolean;
  }>(),
  {
    type: 'full',
    position: 'floating',
    draggable: true,
    showToggle: true,
    forceVirtual: false,
  },
);

const layoutMode = computed<KeyboardLayoutMode>(() =>
  props.type === 'number' ? 'numeric' : 'full',
);

const layoutKey = computed(() => `${layoutMode.value}-${props.position}`);

const useVk = computed(() => shouldUseVirtualKeyboard(props.forceVirtual));

const showEmbeddedPanel = computed(
  () => props.position === 'embedded' && useVk.value,
);

const showFloatingShell = computed(() => props.position === 'floating' && useVk.value);

const syncBuffer = ref('');
const commit = shallowRef<((value: string) => void) | null>(null);
const visible = ref(false);

function bindInput(get: () => string, onCommit: (value: string) => void) {
  commit.value = onCommit;
  syncBuffer.value = get();
}

function open() {
  if (props.position === 'floating') visible.value = true;
}

function close() {
  if (props.position === 'floating') visible.value = false;
}

function toggleVisible() {
  if (props.position === 'floating') visible.value = !visible.value;
}

function resetBinding() {
  commit.value = null;
  syncBuffer.value = '';
}

function onKeyboardInput(value: string) {
  syncBuffer.value = value;
  commit.value?.(value);
}

const kbdApi: RpKeyboardApi = {
  bindInput,
  open,
  close,
  toggle: toggleVisible,
  resetBinding,
};

provide(RP_KEYBOARD_KEY, kbdApi);

const keyboardPanelRef = ref<HTMLElement | null>(null);
const panelLeft = ref(0);
const panelTop = ref(0);
const keyboardDragging = ref(false);

const toggleDockRef = ref<HTMLElement | null>(null);
const toggleLeft = ref(0);
const toggleTop = ref(0);
const toggleDragging = ref(false);

const keyboardPanelStyle = computed(() => ({
  left: `${panelLeft.value}px`,
  top: `${panelTop.value}px`,
}));

const toggleDockStyle = computed(() => ({
  left: `${toggleLeft.value}px`,
  top: `${toggleTop.value}px`,
}));

let dragStartX = 0;
let dragStartY = 0;
let posStartLeft = 0;
let posStartTop = 0;

let toggleDragStartX = 0;
let toggleDragStartY = 0;
let togglePosStartLeft = 0;
let togglePosStartTop = 0;

function defaultPanelPos(): KbPos {
  const panelW = Math.min(520, window.innerWidth - 24);
  const left = Math.max(12, (window.innerWidth - panelW) / 2);
  const estH = 280;
  const top = Math.max(12, window.innerHeight - estH - 12);
  return { left, top };
}

function defaultTogglePos(): KbPos {
  const estW = 220;
  const estH = 48;
  const left = Math.max(12, window.innerWidth - estW - 16);
  const top = Math.max(12, window.innerHeight - estH - 24);
  return { left, top };
}

function loadPanelPos() {
  const raw = LocalStorage.getItem(KB_PANEL_POS_KEY);
  if (isKbPos(raw)) {
    panelLeft.value = raw.left;
    panelTop.value = raw.top;
  } else {
    const d = defaultPanelPos();
    panelLeft.value = d.left;
    panelTop.value = d.top;
  }
}

function loadTogglePos() {
  const raw = LocalStorage.getItem(KB_TOGGLE_POS_KEY);
  if (isKbPos(raw)) {
    toggleLeft.value = raw.left;
    toggleTop.value = raw.top;
  } else {
    const d = defaultTogglePos();
    toggleLeft.value = d.left;
    toggleTop.value = d.top;
  }
}

function clampPanelPos() {
  const el = keyboardPanelRef.value;
  const w = el?.offsetWidth ?? Math.min(520, window.innerWidth - 24);
  const h = el?.offsetHeight ?? 280;
  const maxL = Math.max(0, window.innerWidth - w);
  const maxT = Math.max(0, window.innerHeight - h);
  panelLeft.value = Math.min(Math.max(0, panelLeft.value), maxL);
  panelTop.value = Math.min(Math.max(0, panelTop.value), maxT);
}

function clampTogglePos() {
  const el = toggleDockRef.value;
  const w = el?.offsetWidth ?? 220;
  const h = el?.offsetHeight ?? 48;
  const maxL = Math.max(0, window.innerWidth - w);
  const maxT = Math.max(0, window.innerHeight - h);
  toggleLeft.value = Math.min(Math.max(0, toggleLeft.value), maxL);
  toggleTop.value = Math.min(Math.max(0, toggleTop.value), maxT);
}

function savePanelPos() {
  LocalStorage.set(KB_PANEL_POS_KEY, { left: panelLeft.value, top: panelTop.value });
}

function saveTogglePos() {
  LocalStorage.set(KB_TOGGLE_POS_KEY, { left: toggleLeft.value, top: toggleTop.value });
}

function onKeyboardDragMove(e: PointerEvent) {
  if (!keyboardDragging.value) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  const nextL = posStartLeft + dx;
  const nextT = posStartTop + dy;
  const w = keyboardPanelRef.value?.offsetWidth ?? Math.min(520, window.innerWidth - 24);
  const h = keyboardPanelRef.value?.offsetHeight ?? 280;
  const maxL = Math.max(0, window.innerWidth - w);
  const maxT = Math.max(0, window.innerHeight - h);
  panelLeft.value = Math.min(Math.max(0, nextL), maxL);
  panelTop.value = Math.min(Math.max(0, nextT), maxT);
}

function onKeyboardDragEnd() {
  if (!keyboardDragging.value) return;
  keyboardDragging.value = false;
  window.removeEventListener('pointermove', onKeyboardDragMove);
  window.removeEventListener('pointerup', onKeyboardDragEnd);
  window.removeEventListener('pointercancel', onKeyboardDragEnd);
  savePanelPos();
}

function onKeyboardDragStart(e: PointerEvent) {
  if (!props.draggable) return;
  if (e.button !== 0) return;
  e.preventDefault();
  keyboardDragging.value = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  posStartLeft = panelLeft.value;
  posStartTop = panelTop.value;
  window.addEventListener('pointermove', onKeyboardDragMove);
  window.addEventListener('pointerup', onKeyboardDragEnd);
  window.addEventListener('pointercancel', onKeyboardDragEnd);
}

function onToggleDragMove(e: PointerEvent) {
  if (!toggleDragging.value) return;
  const dx = e.clientX - toggleDragStartX;
  const dy = e.clientY - toggleDragStartY;
  const nextL = togglePosStartLeft + dx;
  const nextT = togglePosStartTop + dy;
  const w = toggleDockRef.value?.offsetWidth ?? 220;
  const h = toggleDockRef.value?.offsetHeight ?? 48;
  const maxL = Math.max(0, window.innerWidth - w);
  const maxT = Math.max(0, window.innerHeight - h);
  toggleLeft.value = Math.min(Math.max(0, nextL), maxL);
  toggleTop.value = Math.min(Math.max(0, nextT), maxT);
}

function onToggleDragEnd() {
  if (!toggleDragging.value) return;
  toggleDragging.value = false;
  window.removeEventListener('pointermove', onToggleDragMove);
  window.removeEventListener('pointerup', onToggleDragEnd);
  window.removeEventListener('pointercancel', onToggleDragEnd);
  saveTogglePos();
}

function onToggleDragStart(e: PointerEvent) {
  if (!props.draggable) return;
  if (e.button !== 0) return;
  e.preventDefault();
  toggleDragging.value = true;
  toggleDragStartX = e.clientX;
  toggleDragStartY = e.clientY;
  togglePosStartLeft = toggleLeft.value;
  togglePosStartTop = toggleTop.value;
  window.addEventListener('pointermove', onToggleDragMove);
  window.addEventListener('pointerup', onToggleDragEnd);
  window.addEventListener('pointercancel', onToggleDragEnd);
}

function onViewportResize() {
  if (props.position === 'embedded') return;
  clampPanelPos();
  clampTogglePos();
  if (visible.value) {
    savePanelPos();
  }
  saveTogglePos();
}

onMounted(() => {
  if (props.position === 'embedded') return;
  loadPanelPos();
  loadTogglePos();
  void nextTick(() => {
    clampTogglePos();
  });
  window.addEventListener('resize', onViewportResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportResize);
  window.removeEventListener('pointermove', onKeyboardDragMove);
  window.removeEventListener('pointerup', onKeyboardDragEnd);
  window.removeEventListener('pointercancel', onKeyboardDragEnd);
  window.removeEventListener('pointermove', onToggleDragMove);
  window.removeEventListener('pointerup', onToggleDragEnd);
  window.removeEventListener('pointercancel', onToggleDragEnd);
});

watch(visible, (open) => {
  if (props.position === 'embedded') return;
  if (open) {
    void nextTick(() => {
      clampPanelPos();
    });
  }
});

watch(showFloatingShell, (show) => {
  if (props.position === 'embedded') return;
  if (show) {
    void nextTick(() => {
      clampTogglePos();
    });
  }
});
</script>

<style scoped lang="scss">
.rp-keyboard-supply {
  display: contents;
}

.rp-vk-embedded {
  width: 100%;
  max-width: min(100vw - 24px, 520px);
  margin: 0 auto;
}

.rp-kb-toggle-spacer {
  width: 8px;
  flex-shrink: 0;
}

.rp-simple-keyboard-drag-spacer {
  min-height: 44px;
  min-width: 8px;
}

.rp-kb-toggle-dock {
  position: fixed;
  z-index: 6100;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  max-width: calc(100vw - 24px);
  background: var(--rp-card);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--rp-foreground) 12%, transparent);
  box-shadow: 0 4px 20px color-mix(in srgb, #000 20%, transparent);
  overflow: hidden;
  box-sizing: border-box;
}

.rp-kb-toggle-dock--dragging {
  box-shadow: 0 8px 28px color-mix(in srgb, #000 26%, transparent);
}

.rp-kb-toggle-drag {
  flex: 0 0 auto;
  width: 36px;
  min-height: 40px;
  cursor: grab;
  color: var(--rp-muted-foreground);
  touch-action: none;
  user-select: none;
}

.rp-kb-toggle-drag:active {
  cursor: grabbing;
}

.rp-kb-toggle-drag-icon {
  color: var(--rp-muted-foreground);
}

.rp-kb-toggle-dock--dragging .rp-kb-toggle-drag {
  cursor: grabbing;
}

.rp-kb-toggle-btn {
  flex: 1 1 auto;
  min-width: 0;
}

.rp-simple-keyboard-panel {
  position: fixed;
  z-index: 6000;
  width: min(100vw, 700px);
  max-width: 100%;
  margin: 0;
  padding: 4px 8px 8px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: var(--rp-card);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--rp-foreground) 12%, transparent);
  box-shadow: 0 8px 32px color-mix(in srgb, #000 22%, transparent);
}

.rp-simple-keyboard-panel--embedded {
  position: relative;
  left: auto;
  top: auto;
  z-index: 1;
  width: 100%;
  box-shadow: 0 2px 16px color-mix(in srgb, #000 12%, transparent);
}

.rp-simple-keyboard-panel--dragging {
  box-shadow: 0 12px 40px color-mix(in srgb, #000 28%, transparent);
}

.rp-simple-keyboard-panel :deep(.rp-simple-keyboard-dom) {
  width: 100%;
  max-width: 100%;
}

.rp-simple-keyboard-panel :deep(.hg-theme-default) {
  background-color: var(--rp-secondary);
}

.rp-simple-keyboard-panel :deep(.hg-button) {
  background: var(--rp-card);
  border-bottom-color: var(--rp-border);
  color: var(--rp-foreground);
}

.rp-simple-keyboard-panel :deep(.hg-button span) {
  color: var(--rp-foreground);
}

.rp-simple-keyboard-panel :deep(.hg-button.hg-activeButton) {
  filter: brightness(0.95);
}

.rp-simple-keyboard-toolbar {
  min-height: 44px;
  gap: 4px;
}

.rp-simple-keyboard-toolbar--dragging {
  cursor: grabbing;
}

.rp-simple-keyboard-drag {
  flex: 1 1 auto;
  min-width: 0;
  cursor: grab;
  padding: 4px 8px 4px 4px;
  border-radius: 8px;
  color: var(--rp-muted-foreground);
  touch-action: none;
  user-select: none;
}

.rp-simple-keyboard-drag:active {
  cursor: grabbing;
}

.rp-kb-drag-icon {
  color: var(--rp-muted-foreground);
  flex-shrink: 0;
}

.rp-kb-drag-label {
  color: var(--rp-muted-foreground);
  margin-left: 4px;
}
</style>
