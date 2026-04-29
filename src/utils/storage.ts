import { LocalStorage } from 'quasar';

export function readJsonStorage<T>(
  key: string,
  isValue: (value: unknown) => value is T,
): T | null {
  const raw = LocalStorage.getItem(key);
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValue(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJsonStorage<T>(key: string, value: T): void {
  LocalStorage.set(key, JSON.stringify(value));
}
