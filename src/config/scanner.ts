import {
  BarcodeFormat,
  LensFacing,
  Resolution,
} from '@capacitor-mlkit/barcode-scanning';
import type { BarcodeFormat as WebBarcodeFormat } from 'barcode-detector';

import { STORAGE_KEYS } from './storage';

/**
 * Single place for barcode scanner defaults and storage keys.
 * Import `mergeScannerRuntime()` when you need overrides (e.g. per-screen formats).
 */

export const SCANNER_STORAGE_KEYS = {
  /** Reserved: persisted JSON overrides for {@link ScannerRuntimeOptions} */
  RUNTIME_PREFS: STORAGE_KEYS.SCANNER_RUNTIME_PREFS,
} as const;

/** All formats supported by ML Kit on native (scan / listeners). */
export const ALL_NATIVE_BARCODE_FORMATS: BarcodeFormat[] = [
  BarcodeFormat.Aztec,
  BarcodeFormat.Codabar,
  BarcodeFormat.Code39,
  BarcodeFormat.Code93,
  BarcodeFormat.Code128,
  BarcodeFormat.DataMatrix,
  BarcodeFormat.Ean8,
  BarcodeFormat.Ean13,
  BarcodeFormat.Itf,
  BarcodeFormat.Pdf417,
  BarcodeFormat.QrCode,
  BarcodeFormat.UpcA,
  BarcodeFormat.UpcE,
];

export interface ScannerRuntimeOptions {
  /** ML Kit formats (native `startScan` / listeners). */
  formats: BarcodeFormat[];
  /** Web-only: `barcode-detector` / ZXing; use `['any']` for all supported kinds. */
  webFormats: WebBarcodeFormat[];
  lensFacing: LensFacing;
  resolution: Resolution;
  /** Ignore identical payloads within this window (ms). */
  duplicateWindowMs: number;
  /** Minimum time between `detect()` calls in the web loop (ms). */
  webDetectIntervalMs: number;
  /** Stop after first decoded value (login QR flow). */
  singleShot: boolean;
  /**
   * Class on `document.body` while native camera runs behind the WebView.
   * @see https://github.com/capawesome-team/capacitor-mlkit
   */
  nativeBodyActiveClass: string;
}

export const DEFAULT_SCANNER_RUNTIME: ScannerRuntimeOptions = {
  formats: ALL_NATIVE_BARCODE_FORMATS,
  webFormats: ['any'],
  lensFacing: LensFacing.Back,
  resolution: Resolution['1280x720'],
  duplicateWindowMs: 1200,
  webDetectIntervalMs: 250,
  singleShot: true,
  nativeBodyActiveClass: 'barcode-scanner-active',
};

export function mergeScannerRuntime(
  partial?: Partial<ScannerRuntimeOptions>,
): ScannerRuntimeOptions {
  return { ...DEFAULT_SCANNER_RUNTIME, ...partial };
}

/** Native `startScan` options derived from runtime (single source). */
export function toNativeStartScanOptions(runtime: ScannerRuntimeOptions) {
  return {
    formats: runtime.formats,
    lensFacing: runtime.lensFacing,
    resolution: runtime.resolution,
  };
}
