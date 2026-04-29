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
