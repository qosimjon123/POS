import {
  cartLineDiscountAbs,
  cartLineGross,
  cartLineNet,
  formatProductStockQtyDisplay,
  productStockLevel,
} from './cart-calculations';
import type { CartLine } from './types';

const baseLine: CartLine = {
  id: 'line-1',
  productId: 'prod-1',
  title: 'Demo',
  imageUrl: null,
  warehouseId: 'wh-1',
  warehouseLabel: 'WH',
  qty: 2,
  rate: 10,
  retailRate: 10,
  wholesaleRate: 8,
  priceListKind: 'retail',
  discountMode: 'percent',
  discountPercent: 10,
  discountFixed: 0,
  uom: 'шт',
};

describe('cart calculations', () => {
  it('calculates percent discounts and net line total', () => {
    expect(cartLineGross(baseLine)).toBe(20);
    expect(cartLineDiscountAbs(baseLine)).toBe(2);
    expect(cartLineNet(baseLine)).toBe(18);
  });

  it('caps fixed discounts at gross line value', () => {
    expect(
      cartLineDiscountAbs({
        ...baseLine,
        discountMode: 'fixed',
        discountFixed: 50,
      }),
    ).toBe(20);
  });

  it('formats stock display and stock level', () => {
    expect(formatProductStockQtyDisplay(120)).toBe('99+');
    expect(productStockLevel(4)).toBe('critical');
    expect(productStockLevel(10)).toBe('low');
    expect(productStockLevel(11)).toBe('ok');
  });
});
