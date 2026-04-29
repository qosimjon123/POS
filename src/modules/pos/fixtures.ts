import { roundMoney } from './cart-calculations';
import type { CatalogProduct, WarehouseOption } from './types';

function wholesaleFromRetail(retail: number): number {
  return roundMoney(retail * 0.85);
}

export const DEMO_WAREHOUSES: WarehouseOption[] = [
  { id: 'wh-store', label: 'Магазин — зал' },
  { id: 'wh-back', label: 'Склад центральный' },
];

export const DEFAULT_WAREHOUSE_ID = 'wh-store';

/** Демо-каталог (позже заменится API). */
export const DEMO_CATALOG: CatalogProduct[] = [
  {
    id: '1',
    title: 'Slim Fit Dress Shirt',
    retailRate: 66.49,
    wholesaleRate: wholesaleFromRetail(66.49),
    uoms: ['шт', 'упак'],
    stockQty: 12,
    imageUrl: 'https://picsum.photos/seed/rprest1/480/480',
    badgeKey: 'popular',
  },
  {
    id: '2',
    title: 'Floral Print Dress',
    retailRate: 85.5,
    wholesaleRate: wholesaleFromRetail(85.5),
    uoms: ['шт'],
    stockQty: 5,
    imageUrl: 'https://picsum.photos/seed/rprest2/480/480',
    badgeKey: 'promo',
  },
  {
    id: '3',
    title: 'White High Heels',
    retailRate: 190,
    wholesaleRate: wholesaleFromRetail(190),
    uoms: ['пара', 'шт'],
    stockQty: 2,
    imageUrl: 'https://picsum.photos/seed/rprest3/480/480',
    badgeKey: 'vip',
  },
  {
    id: '4',
    title: 'Leather Mini Bag',
    retailRate: 120,
    wholesaleRate: wholesaleFromRetail(120),
    uoms: ['шт'],
    stockQty: 105,
    imageUrl: 'https://picsum.photos/seed/rprest4/480/480',
    badgeKey: 'newBadge',
  },
  {
    id: '5',
    title: 'Silk Scarf',
    retailRate: 28,
    wholesaleRate: wholesaleFromRetail(28),
    uoms: ['шт'],
    stockQty: 8,
    imageUrl: 'https://picsum.photos/seed/rprest5/480/480',
    badgeKey: 'hot',
  },
  {
    id: '6',
    title: 'Daily Sneakers',
    retailRate: 74,
    wholesaleRate: wholesaleFromRetail(74),
    uoms: ['пара', 'шт'],
    stockQty: 48,
    imageUrl: 'https://picsum.photos/seed/rprest6/480/480',
    badgeKey: 'fast',
  },
  {
    id: '7',
    title: 'Gift Card',
    retailRate: 25,
    wholesaleRate: wholesaleFromRetail(25),
    uoms: ['шт'],
    stockQty: 3,
    imageUrl: 'https://picsum.photos/seed/rprest7/480/480',
    badgeKey: 'quick',
  },
  {
    id: '8',
    title: 'Classic Sunglasses',
    retailRate: 52,
    wholesaleRate: wholesaleFromRetail(52),
    uoms: ['шт'],
    stockQty: 15,
    imageUrl: 'https://picsum.photos/seed/rprest8/480/480',
    badgeKey: 'sale',
  },
];
