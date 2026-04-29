import type { PosRegister } from './types';

/** Рабочее место кассира; список позже с API по сессии пользователя. */
export const DEMO_REGISTERS: PosRegister[] = [
  {
    id: 'reg-101',
    storeId: 'store-central',
    storeName: 'Центральный',
    name: 'Касса 1',
    hint: 'Основной зал',
    available: true,
    isOpen: true,
    openedAt: '2026-04-14T09:15:00',
  },
  {
    id: 'reg-102',
    storeId: 'store-central',
    storeName: 'Центральный',
    name: 'Касса 2',
    hint: 'Вход',
    available: true,
    isOpen: false,
    openedAt: null,
  },
  {
    id: 'reg-201',
    storeId: 'store-north',
    storeName: 'Северный филиал',
    name: 'Касса 1',
    available: true,
    isOpen: true,
    openedAt: '2026-04-14T08:00:00',
  },
  {
    id: 'reg-202',
    storeId: 'store-north',
    storeName: 'Северный филиал',
    name: 'Касса 2',
    available: false,
    isOpen: false,
    openedAt: null,
  },
];

export function cloneDemoRegisters(): PosRegister[] {
  return DEMO_REGISTERS.map((r) => ({ ...r }));
}
