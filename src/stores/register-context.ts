import { ref } from 'vue';
import { defineStore } from 'pinia';

/** Рабочее место кассира; список позже с API по сессии пользователя. */
export interface PosRegister {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  hint?: string;
  /** false — только просмотр: замок, без входа */
  available: boolean;
  /** Смена на кассе открыта */
  isOpen: boolean;
  /** ISO 8601 времени открытия смены; только если isOpen */
  openedAt: string | null;
}

const DEMO_REGISTERS: PosRegister[] = [
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

export const useRegisterContextStore = defineStore('register-context', () => {
  const selectedRegister = ref<PosRegister | null>(null);
  const availableRegisters = ref<PosRegister[]>(
    DEMO_REGISTERS.map((r) => ({ ...r })),
  );

  function selectRegister(register: PosRegister) {
    selectedRegister.value = register;
  }

  /** После подтверждения в UI «открыть кассу» (позже — ответ API). */
  function confirmRegisterOpened(registerId: string) {
    const r = availableRegisters.value.find((x) => x.id === registerId);
    if (r) {
      r.isOpen = true;
      r.openedAt = new Date().toISOString();
    }
  }

  /** После подтверждения в UI «закрыть смену» (позже — ответ API). */
  function confirmRegisterClosed(registerId: string) {
    const r = availableRegisters.value.find((x) => x.id === registerId);
    if (r) {
      r.isOpen = false;
      r.openedAt = null;
    }
  }

  function setAvailableFromApi(list: PosRegister[]) {
    availableRegisters.value =
      list.length > 0 ? list.map((x) => ({ ...x })) : DEMO_REGISTERS.map((r) => ({ ...r }));
  }

  function clearSelection() {
    selectedRegister.value = null;
  }

  return {
    selectedRegister,
    availableRegisters,
    selectRegister,
    confirmRegisterOpened,
    confirmRegisterClosed,
    setAvailableFromApi,
    clearSelection,
  };
});
