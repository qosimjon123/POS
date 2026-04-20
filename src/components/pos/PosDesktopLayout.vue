<template>
  <div class="rp-pos-desktop-layout column no-wrap col">
    <PosHeader
      v-model:search="search"
      :header-layout="desktopHeaderLayout"
      :show-locale-theme-settings="true"
      :show-cashier-avatar="true"
    />

    <div ref="bodyRef" class="rp-pos-desktop-layout__body col column no-wrap">
      <div class="rp-pos-desktop row no-wrap col items-stretch">
        <aside
          class="rp-pos-desktop__cart"
          :style="{ width: `${cartWidthPx}px`, flex: '0 0 auto' }"
        >
          <div class="rp-pos-desktop__aside-inner">
            <PosCartPanel />
          </div>
        </aside>

        <div
          class="rp-pos-desktop__splitter"
          role="separator"
          aria-orientation="vertical"
          :aria-valuenow="cartWidthPx"
          tabindex="0"
          @pointerdown="onSplitterPointerDown('cart', $event)"
        />

        <main class="rp-pos-desktop__products col">
          <PosProductsPanel />
        </main>

        <div
          class="rp-pos-desktop__splitter"
          role="separator"
          aria-orientation="vertical"
          :aria-valuenow="rightWidthPx"
          tabindex="0"
          @pointerdown="onSplitterPointerDown('right', $event)"
        />

        <aside
          class="rp-pos-desktop__right-wrap"
          :style="{ width: `${rightWidthPx}px`, flex: '0 0 auto' }"
          aria-label="POS"
        >
          <div class="column no-wrap fit col">
            <PosActionsGrid />
            <PosQuickIconRow />
            <q-separator />
            <div class="col-auto q-mt-auto">
              <PosPaymentBar />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';

import PosCartPanel from 'src/components/pos/PosCartPanel.vue';
import PosHeader from 'src/components/pos/PosHeader.vue';
import type { PosHeaderLayout } from 'src/components/pos/pos-layout';
import PosActionsGrid from 'src/components/pos/PosActionsGrid.vue';
import PosPaymentBar from 'src/components/pos/PosPaymentBar.vue';
import PosProductsPanel from 'src/components/pos/PosProductsPanel.vue';
import PosQuickIconRow from 'src/components/pos/PosQuickIconRow.vue';
import { usePosDesktopLayoutStore } from 'src/stores/pos-desktop-layout';

const $q = useQuasar();
const search = defineModel<string>('search', { required: true });

const posLayoutStore = usePosDesktopLayoutStore();
const { cartWidthPx, rightWidthPx } = storeToRefs(posLayoutStore);

const bodyRef = ref<HTMLElement | null>(null);

const desktopHeaderLayout = computed<PosHeaderLayout>(() =>
  $q.screen.name === 'md' ? 'desktop-md' : 'desktop-wide',
);

function bodyWidth(): number {
  return bodyRef.value?.clientWidth ?? 0;
}

function onSplitterPointerDown(which: 'cart' | 'right', e: PointerEvent) {
  if (e.button !== 0) return;
  e.preventDefault();
  const startX = e.clientX;
  const startCart = cartWidthPx.value;
  const startRight = rightWidthPx.value;

  const target = e.currentTarget as HTMLElement;
  target.setPointerCapture(e.pointerId);

  function onMove(ev: PointerEvent) {
    const dx = ev.clientX - startX;
    const w = bodyWidth();
    if (w <= 0) return;
    if (which === 'cart') {
      posLayoutStore.setCartWidthPx(startCart + dx, w);
    } else {
      /* Разделитель слева от правой панели: тянем вправо — край идёт вправо, меню сужается (место каталогу). */
      posLayoutStore.setRightWidthPx(startRight - dx, w);
    }
  }

  function onUp(ev: PointerEvent) {
    target.releasePointerCapture(ev.pointerId);
    target.removeEventListener('pointermove', onMove);
    target.removeEventListener('pointerup', onUp);
    target.removeEventListener('pointercancel', onUp);
    posLayoutStore.persist();
  }

  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerup', onUp);
  target.addEventListener('pointercancel', onUp);
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  posLayoutStore.hydrateFromStorage();
  const w = bodyWidth();
  if (w > 0) {
    posLayoutStore.clampWidthsForBody(w);
  }
  if (typeof ResizeObserver !== 'undefined' && bodyRef.value) {
    ro = new ResizeObserver(() => {
      const bw = bodyWidth();
      if (bw > 0) {
        posLayoutStore.clampWidthsForBody(bw);
      }
    });
    ro.observe(bodyRef.value);
  }
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});
</script>

<style scoped lang="scss">
.rp-pos-desktop-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.rp-pos-desktop-layout__body {
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow: hidden;
}

.rp-pos-desktop {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.rp-pos-desktop__cart,
.rp-pos-desktop__right-wrap {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.rp-pos-desktop__cart {
  overflow: hidden;
}

.rp-pos-desktop__right-wrap {
  background: var(--rp-background);
  border-left: 1px solid var(--rp-border);
}

.rp-pos-desktop__aside-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.rp-pos-desktop__products {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.rp-pos-desktop__splitter {
  flex: 0 0 auto;
  /* совпадает с POS_DESKTOP_SPLITTER_PX в сторе */
  width: 8px;
  min-height: 0;
  align-self: stretch;
  cursor: col-resize;
  touch-action: none;
  user-select: none;
  background: color-mix(in srgb, var(--rp-border) 55%, transparent);
  border-left: 1px solid var(--rp-border);
  border-right: 1px solid var(--rp-border);
  box-sizing: border-box;
  z-index: 2;
}

.rp-pos-desktop__splitter:hover {
  background: color-mix(in srgb, var(--rp-primary) 25%, var(--rp-border));
}

.rp-pos-desktop__splitter:focus-visible {
  outline: 2px solid var(--rp-primary);
  outline-offset: -1px;
}
</style>
