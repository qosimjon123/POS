import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/** Ставка НДС для демо-итогов (как раньше в корзине). */
const TAX_RATE = 0.0625;

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

function newLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ln-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
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

function wholesaleFromRetail(retail: number): number {
  return roundMoney(retail * 0.85);
}

export const usePosCartStore = defineStore('posCart', () => {
  const warehouses = ref<WarehouseOption[]>([
    { id: 'wh-store', label: 'Магазин — зал' },
    { id: 'wh-back', label: 'Склад центральный' },
  ]);

  const defaultWarehouseId = ref('wh-store');

  /** Демо-каталог (позже заменится API). */
  const catalog = ref<CatalogProduct[]>([
    {
      id: '1',
      title: 'Slim Fit Dress Shirt',
      retailRate: 66.49,
      wholesaleRate: wholesaleFromRetail(66.49),
      uoms: ['шт', 'упак'],
      imageUrl: 'https://picsum.photos/seed/rprest1/480/480',
      badgeKey: 'popular',
    },
    {
      id: '2',
      title: 'Floral Print Dress',
      retailRate: 85.5,
      wholesaleRate: wholesaleFromRetail(85.5),
      uoms: ['шт'],
      imageUrl: 'https://picsum.photos/seed/rprest2/480/480',
      badgeKey: 'promo',
    },
    {
      id: '3',
      title: 'White High Heels',
      retailRate: 190,
      wholesaleRate: wholesaleFromRetail(190),
      uoms: ['пара', 'шт'],
      imageUrl: 'https://picsum.photos/seed/rprest3/480/480',
      badgeKey: 'vip',
    },
    {
      id: '4',
      title: 'Leather Mini Bag',
      retailRate: 120,
      wholesaleRate: wholesaleFromRetail(120),
      uoms: ['шт'],
      imageUrl: 'https://picsum.photos/seed/rprest4/480/480',
      badgeKey: 'newBadge',
    },
    {
      id: '5',
      title: 'Silk Scarf',
      retailRate: 28,
      wholesaleRate: wholesaleFromRetail(28),
      uoms: ['шт'],
      imageUrl: 'https://picsum.photos/seed/rprest5/480/480',
      badgeKey: 'hot',
    },
    {
      id: '6',
      title: 'Daily Sneakers',
      retailRate: 74,
      wholesaleRate: wholesaleFromRetail(74),
      uoms: ['пара', 'шт'],
      imageUrl: 'https://picsum.photos/seed/rprest6/480/480',
      badgeKey: 'fast',
    },
    {
      id: '7',
      title: 'Gift Card',
      retailRate: 25,
      wholesaleRate: wholesaleFromRetail(25),
      uoms: ['шт'],
      imageUrl: 'https://picsum.photos/seed/rprest7/480/480',
      badgeKey: 'quick',
    },
    {
      id: '8',
      title: 'Classic Sunglasses',
      retailRate: 52,
      wholesaleRate: wholesaleFromRetail(52),
      uoms: ['шт'],
      imageUrl: 'https://picsum.photos/seed/rprest8/480/480',
      badgeKey: 'sale',
    },
  ]);

  const lines = ref<CartLine[]>([]);

  const lineDialogOpen = ref(false);
  const lineDialogContext = ref<LineDialogContext | null>(null);

  function warehouseById(id: string): WarehouseOption | undefined {
    return warehouses.value.find((w) => w.id === id);
  }

  function openCatalogLineDialog(productId: string) {
    lineDialogContext.value = { mode: 'catalog', productId };
    lineDialogOpen.value = true;
  }

  function openCartLineDialog(lineId: string) {
    lineDialogContext.value = { mode: 'cart', lineId };
    lineDialogOpen.value = true;
  }

  function closeLineDialog() {
    lineDialogOpen.value = false;
    lineDialogContext.value = null;
  }

  /**
   * Слияние только при совпадении товара, склада и ЕИ — отдельные склады дают отдельные строки.
   */
  function addOrMergeLine(payload: Omit<CartLine, 'id'>): void {
    const existing = lines.value.find(
      (l) =>
        l.productId === payload.productId &&
        l.warehouseId === payload.warehouseId &&
        l.uom === payload.uom,
    );
    if (existing) {
      existing.qty += payload.qty;
      return;
    }
    lines.value.push({ ...payload, id: newLineId() });
  }

  function addFromCatalog(
    productId: string,
    warehouseId: string,
    qty: number,
    rate: number,
    uom: string,
    priceListKind: PriceListKind,
    discountMode: 'percent' | 'fixed',
    discountPercent: number,
    discountFixed: number,
  ): void {
    const product = catalog.value.find((p) => p.id === productId);
    const wh = warehouseById(warehouseId);
    if (!product || !wh) return;

    addOrMergeLine({
      productId: product.id,
      title: product.title,
      imageUrl: product.imageUrl ?? null,
      warehouseId: wh.id,
      warehouseLabel: wh.label,
      qty,
      rate,
      retailRate: product.retailRate,
      wholesaleRate: product.wholesaleRate,
      priceListKind,
      discountMode,
      discountPercent,
      discountFixed,
      uom,
    });
  }

  /** Быстрое добавление из витрины: склад по умолчанию, первая ЕИ, розница; повторный вызов увеличивает qty. */
  function quickAddFromCatalog(productId: string): void {
    const product = catalog.value.find((p) => p.id === productId);
    const wh = warehouseById(defaultWarehouseId.value);
    if (!product || !wh) return;
    const uom = product.uoms[0] ?? 'шт';
    addOrMergeLine({
      productId: product.id,
      title: product.title,
      imageUrl: product.imageUrl ?? null,
      warehouseId: wh.id,
      warehouseLabel: wh.label,
      qty: 1,
      rate: product.retailRate,
      retailRate: product.retailRate,
      wholesaleRate: product.wholesaleRate,
      priceListKind: 'retail',
      discountMode: 'percent',
      discountPercent: 0,
      discountFixed: 0,
      uom,
    });
  }

  const qtyByProductId = computed(() => {
    const acc: Record<string, number> = {};
    for (const l of lines.value) {
      acc[l.productId] = (acc[l.productId] ?? 0) + l.qty;
    }
    return acc;
  });

  function updateLine(
    lineId: string,
    patch: Partial<
      Pick<
        CartLine,
        | 'qty'
        | 'rate'
        | 'discountPercent'
        | 'discountFixed'
        | 'discountMode'
        | 'uom'
        | 'priceListKind'
      >
    >,
  ): void {
    const line = lines.value.find((l) => l.id === lineId);
    if (!line) return;
    if (patch.qty !== undefined) line.qty = Math.max(1, patch.qty);
    if (patch.rate !== undefined) line.rate = Math.max(0, patch.rate);
    if (patch.discountPercent !== undefined) {
      line.discountPercent = Math.min(100, Math.max(0, patch.discountPercent));
    }
    if (patch.discountFixed !== undefined) {
      line.discountFixed = Math.max(0, patch.discountFixed);
    }
    if (patch.discountMode !== undefined) line.discountMode = patch.discountMode;
    if (patch.uom !== undefined) line.uom = patch.uom;
    if (patch.priceListKind !== undefined) line.priceListKind = patch.priceListKind;
  }

  function incrementLineQty(lineId: string, delta: number): void {
    const line = lines.value.find((l) => l.id === lineId);
    if (!line) return;
    const next = line.qty + delta;
    if (next < 1) {
      removeLine(lineId);
      return;
    }
    line.qty = next;
  }

  function removeLine(lineId: string): void {
    lines.value = lines.value.filter((l) => l.id !== lineId);
    const ctx = lineDialogContext.value;
    if (ctx?.mode === 'cart' && ctx.lineId === lineId) {
      closeLineDialog();
    }
  }

  function clearCart(): void {
    lines.value = [];
  }

  function lineGross(line: CartLine): number {
    return roundMoney(line.qty * line.rate);
  }

  function lineDiscountAbs(line: CartLine): number {
    if (line.discountMode === 'fixed') {
      const gross = lineGross(line);
      return roundMoney(Math.min(Math.max(0, line.discountFixed), gross));
    }
    return roundMoney(lineGross(line) * (line.discountPercent / 100));
  }

  function lineNet(line: CartLine): number {
    return roundMoney(lineGross(line) - lineDiscountAbs(line));
  }

  const subtotalGross = computed(() =>
    roundMoney(lines.value.reduce((s, l) => s + lineGross(l), 0)),
  );

  const discountAbs = computed(() =>
    roundMoney(lines.value.reduce((s, l) => s + lineDiscountAbs(l), 0)),
  );

  const subtotalNet = computed(() => roundMoney(subtotalGross.value - discountAbs.value));

  const taxAmount = computed(() =>
    lines.value.length === 0 ? 0 : roundMoney(subtotalNet.value * TAX_RATE),
  );

  const totalDue = computed(() => roundMoney(subtotalNet.value + taxAmount.value));

  const totalsFormatted = computed(() => ({
    subtotalFmt: formatUsd(subtotalGross.value),
    discountFmt: discountAbs.value > 0 ? `-${formatUsd(discountAbs.value)}` : formatUsd(0),
    taxFmt: formatUsd(taxAmount.value),
    totalFmt: formatUsd(totalDue.value),
    lineCount: lines.value.length,
  }));

  function lineDisplayPrice(line: CartLine): string {
    return formatUsd(lineNet(line));
  }

  function lineDisplayDetails(line: CartLine): string {
    return `${line.warehouseLabel}\n${cartLinePriceListCaption(line)}`;
  }

  return {
    warehouses,
    defaultWarehouseId,
    catalog,
    lines,
    lineDialogOpen,
    lineDialogContext,
    openCatalogLineDialog,
    openCartLineDialog,
    closeLineDialog,
    addFromCatalog,
    quickAddFromCatalog,
    qtyByProductId,
    updateLine,
    incrementLineQty,
    removeLine,
    clearCart,
    warehouseById,
    subtotalGross,
    discountAbs,
    subtotalNet,
    taxAmount,
    totalDue,
    totalsFormatted,
    lineDisplayPrice,
    lineDisplayDetails,
  };
});
