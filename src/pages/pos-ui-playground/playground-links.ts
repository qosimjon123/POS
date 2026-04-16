/** Маршруты витрины UI (slug → ключ i18n playground.links.*). */
export const PLAYGROUND_LINKS = [
  { slug: 'shell', labelKey: 'playground.links.shell' },
  { slug: 'product-browser', labelKey: 'playground.links.productBrowser' },
  { slug: 'cart-panel', labelKey: 'playground.links.cartPanel' },
  { slug: 'cart-line-editor', labelKey: 'playground.links.cartLineEditor' },
  { slug: 'checkout-sheet', labelKey: 'playground.links.checkoutSheet' },
  { slug: 'customer-picker', labelKey: 'playground.links.customerPicker' },
  { slug: 'customer-create', labelKey: 'playground.links.customerCreate' },
  { slug: 'payment-flow', labelKey: 'playground.links.paymentFlow' },
  { slug: 'shift-open', labelKey: 'playground.links.shiftOpen' },
  { slug: 'shift-close', labelKey: 'playground.links.shiftClose' },
  { slug: 'return-flow', labelKey: 'playground.links.returnFlow' },
  { slug: 'table-map', labelKey: 'playground.links.tableMap' },
  { slug: 'kot-actions', labelKey: 'playground.links.kotActions' },
  { slug: 'sync-status', labelKey: 'playground.links.syncStatus' },
  { slug: 'settings-sheet', labelKey: 'playground.links.settingsSheet' },
] as const;

export type PlaygroundSlug = (typeof PLAYGROUND_LINKS)[number]['slug'];

const SLUGS = new Set<string>(PLAYGROUND_LINKS.map((x) => x.slug));

export function isPlaygroundSlug(s: string): s is PlaygroundSlug {
  return SLUGS.has(s);
}
