import { createPinia, setActivePinia } from 'pinia';

import { usePosDesktopLayoutStore } from './pos-desktop-layout';

describe('pos desktop layout store', () => {
  it('clamps side widths while preserving center minimum', () => {
    setActivePinia(createPinia());
    const store = usePosDesktopLayoutStore();

    store.setCartWidthPx(900, 1000);
    store.setRightWidthPx(900, 1000);

    expect(store.cartWidthPx + store.rightWidthPx).toBeLessThanOrEqual(
      store.maxSideSum(1000),
    );
    expect(store.cartWidthPx).toBeLessThanOrEqual(store.maxCartPx(1000));
    expect(store.rightWidthPx).toBeLessThanOrEqual(store.maxRightPx(1000));
  });
});
