import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LocalStorage } from 'quasar';

const STORAGE_KEY = 'rp-pos-desktop-layout';

/** Полоска между колонками (px), учитывается в расчёте центра. */
export const POS_DESKTOP_SPLITTER_PX = 8;

/** Доли от ширины body (1 = 100%). */
export const POS_DESKTOP_MAX_CART_RATIO = 0.3;
export const POS_DESKTOP_MAX_RIGHT_RATIO = 0.3;
/** Минимальная доля зоны товаров между разделителями. */
export const POS_DESKTOP_MIN_CENTER_RATIO = 0.4;

export const POS_DESKTOP_MIN_CART_PX = 240;
export const POS_DESKTOP_MIN_RIGHT_PX = 240;

/** Fallback, если нет ширины окна (до первого clamp). */
export const POS_DESKTOP_DEFAULT_CART_PX = 320;
export const POS_DESKTOP_DEFAULT_RIGHT_PX = 320;

export interface PosDesktopWidthsPayload {
  cartWidthPx: number;
  rightWidthPx: number;
}

function isDesktopBreakpoint(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function minCenterPx(bodyWidthPx: number): number {
  return Math.max(0, Math.floor(bodyWidthPx * POS_DESKTOP_MIN_CENTER_RATIO));
}

function maxCartPx(bodyWidthPx: number): number {
  return Math.max(0, Math.floor(bodyWidthPx * POS_DESKTOP_MAX_CART_RATIO));
}

function maxRightPx(bodyWidthPx: number): number {
  return Math.max(0, Math.floor(bodyWidthPx * POS_DESKTOP_MAX_RIGHT_RATIO));
}

export const usePosDesktopLayoutStore = defineStore('posDesktopLayout', () => {
  const cartWidthPx = ref(POS_DESKTOP_DEFAULT_CART_PX);
  const rightWidthPx = ref(POS_DESKTOP_DEFAULT_RIGHT_PX);

  /** Максимум суммы (корзина + правая) при учёте минимума центра 40%. */
  function maxSideSum(bodyWidthPx: number): number {
    return Math.max(
      0,
      bodyWidthPx - 2 * POS_DESKTOP_SPLITTER_PX - minCenterPx(bodyWidthPx),
    );
  }

  /** Поджимает корзину и правую панель: центр ≥40%, боковые ≤30% каждая. */
  function clampWidthsForBody(bodyWidthPx: number) {
    const w = bodyWidthPx;
    const maxSum = maxSideSum(w);
    const capC = maxCartPx(w);
    const capR = maxRightPx(w);

    if (maxSum <= 0) {
      cartWidthPx.value = 0;
      rightWidthPx.value = 0;
      return;
    }

    const loC = Math.min(POS_DESKTOP_MIN_CART_PX, capC);
    const loR = Math.min(POS_DESKTOP_MIN_RIGHT_PX, capR);

    let c = clamp(cartWidthPx.value, loC, capC);
    let r = clamp(rightWidthPx.value, loR, capR);

    if (c + r > maxSum) {
      r = clamp(r, loR, Math.min(capR, maxSum - loC));
      c = clamp(c, loC, Math.min(capC, maxSum - loR));
      if (c + r > maxSum) {
        const excess = c + r - maxSum;
        if (r >= c) {
          r = Math.max(loR, r - excess);
        } else {
          c = Math.max(loC, c - excess);
        }
      }
    }

    cartWidthPx.value = Math.round(c);
    rightWidthPx.value = Math.round(r);
  }

  function setCartWidthPx(next: number, bodyWidthPx: number) {
    const w = bodyWidthPx;
    const maxSum = maxSideSum(w);
    const capC = maxCartPx(w);
    const capR = maxRightPx(w);
    const loC = Math.min(POS_DESKTOP_MIN_CART_PX, capC);
    const loR = Math.min(POS_DESKTOP_MIN_RIGHT_PX, capR);
    const r = clamp(rightWidthPx.value, loR, capR);
    const upper = Math.min(capC, maxSum - r);
    cartWidthPx.value = Math.round(clamp(next, loC, Math.max(loC, upper)));
  }

  function setRightWidthPx(next: number, bodyWidthPx: number) {
    const w = bodyWidthPx;
    const maxSum = maxSideSum(w);
    const capC = maxCartPx(w);
    const capR = maxRightPx(w);
    const loC = Math.min(POS_DESKTOP_MIN_CART_PX, capC);
    const loR = Math.min(POS_DESKTOP_MIN_RIGHT_PX, capR);
    const c = clamp(cartWidthPx.value, loC, capC);
    const upper = Math.min(capR, maxSum - c);
    rightWidthPx.value = Math.round(clamp(next, loR, Math.max(loR, upper)));
  }

  function hydrateFromStorage() {
    if (!isDesktopBreakpoint()) return;
    const raw = LocalStorage.getItem(STORAGE_KEY);
    if (typeof raw !== 'string' || !raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (
        parsed &&
        typeof parsed === 'object' &&
        'cartWidthPx' in parsed &&
        'rightWidthPx' in parsed
      ) {
        const p = parsed as PosDesktopWidthsPayload;
        if (typeof p.cartWidthPx === 'number' && typeof p.rightWidthPx === 'number') {
          cartWidthPx.value = p.cartWidthPx;
          rightWidthPx.value = p.rightWidthPx;
        }
      }
    } catch {
      /* ignore */
    }
  }

  function persist() {
    if (!isDesktopBreakpoint()) return;
    const payload: PosDesktopWidthsPayload = {
      cartWidthPx: cartWidthPx.value,
      rightWidthPx: rightWidthPx.value,
    };
    LocalStorage.set(STORAGE_KEY, JSON.stringify(payload));
  }

  /** Дефолт: 30% + 30% + 40% (центр), при наличии ширины body. */
  function resetToDefault(bodyWidthPx?: number) {
    const w = bodyWidthPx;
    if (w != null && w > 0) {
      cartWidthPx.value = Math.round(w * POS_DESKTOP_MAX_CART_RATIO);
      rightWidthPx.value = Math.round(w * POS_DESKTOP_MAX_RIGHT_RATIO);
      clampWidthsForBody(w);
    } else {
      cartWidthPx.value = POS_DESKTOP_DEFAULT_CART_PX;
      rightWidthPx.value = POS_DESKTOP_DEFAULT_RIGHT_PX;
    }
    if (isDesktopBreakpoint()) {
      LocalStorage.remove(STORAGE_KEY);
    }
  }

  return {
    cartWidthPx,
    rightWidthPx,
    minCenterPx,
    maxCartPx,
    maxRightPx,
    maxSideSum,
    clampWidthsForBody,
    setCartWidthPx,
    setRightWidthPx,
    hydrateFromStorage,
    persist,
    resetToDefault,
  };
});
