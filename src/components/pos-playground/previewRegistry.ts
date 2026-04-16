import type { Component } from 'vue';

import type { PlaygroundSlug } from 'src/pages/pos-ui-playground/playground-links';

import CartLineEditorPreview from 'src/components/pos-playground/previews/CartLineEditorPreview.vue';
import CartPanelPreview from 'src/components/pos-playground/previews/CartPanelPreview.vue';
import CheckoutSheetPreview from 'src/components/pos-playground/previews/CheckoutSheetPreview.vue';
import CustomerCreatePreview from 'src/components/pos-playground/previews/CustomerCreatePreview.vue';
import CustomerPickerPreview from 'src/components/pos-playground/previews/CustomerPickerPreview.vue';
import KotActionsPreview from 'src/components/pos-playground/previews/KotActionsPreview.vue';
import PaymentFlowPreview from 'src/components/pos-playground/previews/PaymentFlowPreview.vue';
import ProductBrowserPreview from 'src/components/pos-playground/previews/ProductBrowserPreview.vue';
import ReturnFlowPreview from 'src/components/pos-playground/previews/ReturnFlowPreview.vue';
import SettingsSheetPreview from 'src/components/pos-playground/previews/SettingsSheetPreview.vue';
import ShellPreview from 'src/components/pos-playground/previews/ShellPreview.vue';
import ShiftClosePreview from 'src/components/pos-playground/previews/ShiftClosePreview.vue';
import ShiftOpenPreview from 'src/components/pos-playground/previews/ShiftOpenPreview.vue';
import SyncStatusPreview from 'src/components/pos-playground/previews/SyncStatusPreview.vue';
import TableMapPreview from 'src/components/pos-playground/previews/TableMapPreview.vue';

export const PLAYGROUND_PREVIEW_BY_SLUG: Record<PlaygroundSlug, Component> = {
  shell: ShellPreview,
  'product-browser': ProductBrowserPreview,
  'cart-panel': CartPanelPreview,
  'cart-line-editor': CartLineEditorPreview,
  'checkout-sheet': CheckoutSheetPreview,
  'customer-picker': CustomerPickerPreview,
  'customer-create': CustomerCreatePreview,
  'payment-flow': PaymentFlowPreview,
  'shift-open': ShiftOpenPreview,
  'shift-close': ShiftClosePreview,
  'return-flow': ReturnFlowPreview,
  'table-map': TableMapPreview,
  'kot-actions': KotActionsPreview,
  'sync-status': SyncStatusPreview,
  'settings-sheet': SettingsSheetPreview,
};
