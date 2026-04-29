export type PriceListKind = 'retail' | 'wholesale';

export interface WarehouseOption {
  id: string;
  label: string;
}

export interface CatalogProduct {
  id: string;
  title: string;
  /** Розничная цена по прайсу. */
  retailRate: number;
  /** Оптовая цена по прайсу. */
  wholesaleRate: number;
  uoms: string[];
  /** Остаток на складе (для индикатора в каталоге). */
  stockQty: number;
  imageUrl?: string;
  badgeKey?: 'popular' | 'promo' | 'vip' | 'newBadge' | 'hot' | 'fast' | 'quick' | 'sale';
}

export interface CartLine {
  id: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  warehouseId: string;
  warehouseLabel: string;
  qty: number;
  /** Фактическая цена в строке. */
  rate: number;
  /** Снимок прайса на момент добавления. */
  retailRate: number;
  wholesaleRate: number;
  /** Какой вид цены выбран как опорный (опт / розница). */
  priceListKind: PriceListKind;
  discountMode: 'percent' | 'fixed';
  discountPercent: number;
  /** Скидка фикс. суммой по строке (при discountMode === 'fixed'). */
  discountFixed: number;
  uom: string;
}

export type LineDialogContext =
  | { mode: 'catalog'; productId: string }
  | { mode: 'cart'; lineId: string };

/** Уровень остатка: <5 критично, 5-10 низкий, >10 норма. */
export type ProductStockLevel = 'critical' | 'low' | 'ok';
