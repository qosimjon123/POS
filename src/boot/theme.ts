import { defineBoot } from '#q-app/wrappers';
import { Dark, LocalStorage } from 'quasar';

const STORAGE_KEY = 'rp-theme-dark';

export default defineBoot(() => {
  if (LocalStorage.hasItem(STORAGE_KEY)) {
    Dark.set(LocalStorage.getItem<boolean>(STORAGE_KEY)!);
  }
});
