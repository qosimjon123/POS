import type { CartLine, ProductStockLevel } from './types';

/** Ставка НДС для демо-итогов (как раньше в корзине). */
export const POS_TAX_RATE = 0.0625;

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

export function productStockLevel(qty: number): ProductStockLevel {
  const q = Math.floor(Number(qty));
  if (!Number.isFinite(q) || q < 0) return 'critical';
  if (q < 5) return 'critical';
  if (q <= 10) return 'low';
  return 'ok';
}

/** Для отображения: при остатке > 99 показываем «99+». */
export function formatProductStockQtyDisplay(qty: number): string {
  const q = Math.floor(Number(qty));
  if (!Number.isFinite(q) || q < 0) return '0';
  if (q > 99) return '99+';
  return String(q);
}

/** В списке корзины: только розница/опт и скидка по строке (без склада и без «N ед. × цена»). */
export function cartLinePriceListCaption(line: CartLine): string {
  let disc = '';
  if (line.discountMode === 'fixed' && line.discountFixed > 0) {
    disc = ` · −${formatUsd(line.discountFixed)}`;
  } else if (line.discountPercent > 0) {
    disc = ` · −${line.discountPercent}%`;
  }
  const priceListLabel = line.priceListKind === 'wholesale' ? 'Опт' : 'Розница';
  return `${priceListLabel}${disc}`;
}

/** Сумма по строке до скидки (qty × rate). */
export function cartLineGross(line: CartLine): number {
  return roundMoney(line.qty * line.rate);
}

/** Абсолют скидки по строке. */
export function cartLineDiscountAbs(line: CartLine): number {
  if (line.discountMode === 'fixed') {
    const gross = cartLineGross(line);
    return roundMoney(Math.min(Math.max(0, line.discountFixed), gross));
  }
  return roundMoney(cartLineGross(line) * (line.discountPercent / 100));
}

/** Итог по строке после скидки. */
export function cartLineNet(line: CartLine): number {
  return roundMoney(cartLineGross(line) - cartLineDiscountAbs(line));
}
