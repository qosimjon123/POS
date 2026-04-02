import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BarcodeDetector } from 'barcode-detector';

import {
  mergeScannerRuntime,
  type ScannerRuntimeOptions,
} from 'src/config/scanner';

import type { UnifiedScanResult } from './types';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result as string;
      const base64 = s.includes(',') ? (s.split(',')[1] ?? '') : s;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function extFromFile(file: File): string {
  const fromName = file.name.split('.').pop();
  if (fromName && /^[a-z0-9]+$/i.test(fromName) && fromName.length <= 5) {
    return fromName.toLowerCase();
  }
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

/**
 * ML Kit `readBarcodesFromImage` (native) или BarcodeDetector (web).
 */
export async function readBarcodeFromImageFile(
  file: File,
  runtimeOverride?: Partial<ScannerRuntimeOptions>,
): Promise<UnifiedScanResult | null> {
  const runtime = mergeScannerRuntime(runtimeOverride);

  if (!Capacitor.isNativePlatform()) {
    const bitmap = await createImageBitmap(file);
    try {
      const detector = new BarcodeDetector({ formats: runtime.webFormats });
      const codes = await detector.detect(bitmap);
      const c = codes[0];
      if (!c?.rawValue?.trim()) return null;
      const value = c.rawValue.trim();
      return {
        value,
        displayValue: value,
        format: String(c.format),
        source: 'web',
      };
    } finally {
      bitmap.close();
    }
  }

  const base64Data = await fileToBase64(file);
  const fileName = `rp_qr_${Date.now()}.${extFromFile(file)}`;

  const { uri } = await Filesystem.writeFile({
    path: fileName,
    directory: Directory.Cache,
    data: base64Data,
  });

  try {
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
      path: uri,
      formats: runtime.formats,
    });
    const b = barcodes[0];
    if (!b) return null;
    const value = (b.rawValue ?? b.displayValue ?? '').trim();
    if (!value) return null;
    return {
      value,
      displayValue: b.displayValue ?? value,
      format: String(b.format),
      source: 'capacitor',
    };
  } finally {
    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Cache,
    }).catch(() => undefined);
  }
}
