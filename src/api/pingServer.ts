import { getFrappeCall } from 'src/api/frappeClient/backendClient';

/** Проверка доступности Frappe (`frappe.ping`). */
export async function pingServer(): Promise<boolean> {
  const call = getFrappeCall();
  if (!call) {
    return false;
  }
  try {
    await call.get('frappe.ping');
    return true;
  } catch {
    return false;
  }
}
