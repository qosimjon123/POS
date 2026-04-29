import { rewriteMethodUrlToV2 } from './methodPaths';

describe('rewriteMethodUrlToV2', () => {
  it('rewrites business methods to Frappe v2', () => {
    expect(rewriteMethodUrlToV2('/api/method/fadl_pos.api.sales.create')).toBe(
      '/api/v2/method/fadl_pos.api.sales.create',
    );
  });

  it('keeps cookie auth methods on v1', () => {
    expect(rewriteMethodUrlToV2('/api/method/login')).toBe('/api/method/login');
    expect(rewriteMethodUrlToV2('/api/method/frappe.auth.get_logged_user')).toBe(
      '/api/method/frappe.auth.get_logged_user',
    );
  });

  it('preserves query strings while rewriting', () => {
    expect(rewriteMethodUrlToV2('/api/method/fadl_pos.ping?x=1')).toBe(
      '/api/v2/method/fadl_pos.ping?x=1',
    );
  });
});
