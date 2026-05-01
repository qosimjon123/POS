/**
 * Минимальные константы для `catch`: свои ветки пишете сами через `status` / `exc_type`.
 */

/** По Frappe-поведению: 401 или эти исключения → можно clear session и редирект на логин. */
export const FRAPPE_SESSION_TERMINATED_EXC_TYPES = new Set<string>([
  'AuthenticationError',
  'SessionExpired',
]);

/** `AuthenticationError`, `frappe.exceptions.AuthenticationError` → `AuthenticationError`. */
export function normalizeFrappeExcType(raw: string | undefined): string {
  if (!raw) return '';
  const t = raw.trim();
  return t.includes('.') ? (t.split('.').pop() ?? t) : t;
}

/** Сырой объект из ошибки frappe-js-sdk (`httpStatus`, `exc_type`, `exception`). */
export function frappeThrownHttpStatus(e: unknown): number | undefined {
  if (typeof e !== 'object' || e === null) return undefined;
  const { httpStatus } = e as { httpStatus?: unknown };
  return typeof httpStatus === 'number' ? httpStatus : undefined;
}

export function frappeThrownExcType(e: unknown): string | undefined {
  if (typeof e !== 'object' || e === null) return undefined;
  const rec = e as Record<string, unknown>;
  if (typeof rec.exc_type === 'string') return normalizeFrappeExcType(rec.exc_type);
  const ex = rec.exception;
  if (typeof ex !== 'string') return undefined;
  const m = /^(?:[\w.]+\.)?(\w+)/.exec(ex.trim());
  return m ? normalizeFrappeExcType(m[1]) : undefined;
}

/** `true`, если нужно считать сессию недействительной (очистить + редирект на логин). */
export function isFrappeSessionTerminated(e: unknown): boolean {
  if (frappeThrownHttpStatus(e) === 401) return true;
  const short = frappeThrownExcType(e);
  return Boolean(short && FRAPPE_SESSION_TERMINATED_EXC_TYPES.has(short));
}
