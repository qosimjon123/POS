import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import {
  POS_TAX_RATE,
  cartLineDiscountAbs,
  cartLineGross,
  cartLineNet,
  cartLinePriceListCaption,
  formatUsd,
  roundMoney,
} from 'src/modules/pos/cart-calculations';
import {
  DEFAULT_WAREHOUSE_ID,
  DEMO_CATALOG,
  DEMO_WAREHOUSES,
} from 'src/modules/pos/fixtures';
import type {
  CartLine,
  LineDialogContext,
  PriceListKind,
  WarehouseOption,
} from 'src/modules/pos/types';
export {
  cartLineDiscountAbs,
  cartLineGross,
  cartLineNet,
  cartLinePriceListCaption,
  formatProductStockQtyDisplay,
  formatUsd,
  productStockLevel,
} from 'src/modules/pos/cart-calculations';
export type {
  CartLine,
  CatalogProduct,
  LineDialogContext,
  PriceListKind,
  ProductStockLevel,
  WarehouseOption,
} from 'src/modules/pos/types';

function newLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ln-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const usePosCartStore = defineStore('pos-cart', () => {
  const warehouses = ref<WarehouseOption[]>(DEMO_WAREHOUSES.map((w) => ({ ...w })));

  const defaultWarehouseId = ref(DEFAULT_WAREHOUSE_ID);

  const catalog = ref(DEMO_CATALOG.map((p) => ({ ...p, uoms: [...p.uoms] })));

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

  const subtotalGross = computed(() =>
    roundMoney(lines.value.reduce((s, l) => s + cartLineGross(l), 0)),
  );

  const discountAbs = computed(() =>
    roundMoney(lines.value.reduce((s, l) => s + cartLineDiscountAbs(l), 0)),
  );

  const subtotalNet = computed(() => roundMoney(subtotalGross.value - discountAbs.value));

  const taxAmount = computed(() =>
    lines.value.length === 0 ? 0 : roundMoney(subtotalNet.value * POS_TAX_RATE),
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
    return formatUsd(cartLineNet(line));
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
