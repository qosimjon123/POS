export const API_METHOD_PREFIX = '/api/method/';
export const API_V2_METHOD_PREFIX = '/api/v2/method/';

/**
 * Эти RPC должны оставаться на v1 при cookie-сессии Frappe.
 * `/api/v2/method/login` не создаёт пользовательскую сессию.
 */
export const V1_ONLY_METHOD_PATHS = new Set([
  'login',
  'frappe.auth.get_logged_user',
]);

export function rewriteMethodUrlToV2(url: string): string {
  if (!url.startsWith(API_METHOD_PREFIX)) return url;
  const methodPath = url.slice(API_METHOD_PREFIX.length).split('?')[0] ?? '';
  if (V1_ONLY_METHOD_PATHS.has(methodPath)) return url;
  return API_V2_METHOD_PREFIX + url.slice(API_METHOD_PREFIX.length);
}
