/** Страница: `PosMobileLayout` vs `PosDesktopLayout` (граница — Quasar `lt.md`). */
export type PosShell = 'mobile' | 'desktop';

/** Шапка: задаётся оболочкой (`mobile` | `desktop-md` | `desktop-wide`). Не путать с `RpKeyboard` layout. */
export type PosHeaderLayout = 'mobile' | 'desktop-md' | 'desktop-wide';

export function resolvePosShell(ltMd: boolean): PosShell {
  return ltMd ? 'mobile' : 'desktop';
}
