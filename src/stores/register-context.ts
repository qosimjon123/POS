import { ref } from 'vue';
import { defineStore } from 'pinia';

import { cloneDemoRegisters } from 'src/modules/register/fixtures';
import type { PosRegister } from 'src/modules/register/types';

export type { PosRegister } from 'src/modules/register/types';

export const useRegisterContextStore = defineStore('register-context', () => {
  const selectedRegister = ref<PosRegister | null>(null);
  const availableRegisters = ref<PosRegister[]>(cloneDemoRegisters());

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
      list.length > 0 ? list.map((x) => ({ ...x })) : cloneDemoRegisters();
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
