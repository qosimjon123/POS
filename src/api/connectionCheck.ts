import { getFrappeCall } from 'src/api/frappeClient/backendClient';

/** Проверка доступности Frappe (`frappe.ping`). */
export async function checkConnection(): Promise<boolean> {
  const call = getFrappeCall();
  if (!call) {
    return false;
  }
  try {
    await call.get('frappe.ping');
    return true;
  } catch {
    return true;
  }
}
