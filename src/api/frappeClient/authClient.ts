import { getFrappeAuth } from './backendClient';

export async function loginWithUsernamePassword(
  username: string,
  password: string,
): Promise<string | null> {
  const frappe = getFrappeAuth();
  if (!frappe) return null;
  await frappe.loginWithUsernamePassword({ username: username.trim(), password });
  return frappe.getLoggedInUser();
}

export async function getLoggedInUsername(): Promise<string | null> {
  const frappe = getFrappeAuth();
  if (!frappe) return null;
  return frappe.getLoggedInUser();
}

export async function logoutCurrentUser(): Promise<void> {
  const frappe = getFrappeAuth();
  if (!frappe) return;
  await frappe.logout();
}
