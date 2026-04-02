import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, type Barcode } from '@capacitor-mlkit/barcode-scanning';
import { BarcodeDetector } from 'barcode-detector';

import {
  mergeScannerRuntime,
  type ScannerRuntimeOptions,
} from 'src/config/scanner';

import type { UnifiedScanResult } from './types';

function toUnified(
  b: Barcode,
  source: UnifiedScanResult['source'],
): UnifiedScanResult {
  const value = (b.rawValue ?? b.displayValue ?? '').trim();
  return {
    value,
    displayValue: b.displayValue ?? value,
    format: String(b.format),
    source,
  };
}

function createDuplicateGate(runtime: ScannerRuntimeOptions) {
  let last = '';
  let lastAt = 0;
  return (value: string): boolean => {
    const now = Date.now();
    if (
      value === last &&
      now - lastAt < runtime.duplicateWindowMs
    ) {
      return false;
    }
    last = value;
    lastAt = now;
    return true;
  };
}

/** Camera permission for ML Kit (native only). */
export async function ensureNativeScannerPermissions(): Promise<boolean> {
  const { camera } = await BarcodeScanner.checkPermissions();
  if (camera === 'granted' || camera === 'limited') return true;
  const req = await BarcodeScanner.requestPermissions();
  return req.camera === 'granted' || req.camera === 'limited';
}

/** Web: if Permissions API says camera denied, skip getUserMedia. */
export async function ensureWebCameraPermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    if (navigator.permissions?.query) {
      const { state } = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      if (state === 'denied') return false;
    }
  } catch {
    /* Permissions API unsupported or query failed — try getUserMedia */
  }
  return true;
}

/**
 * Android: ensure Google Play barcode scanner module (used by `scan()`).
 * Polls after install until available or timeout.
 */
export async function ensureAndroidGoogleScanModule(): Promise<boolean> {
  const { available } =
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
  if (available) return true;

  await BarcodeScanner.installGoogleBarcodeScannerModule();

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
    const { available: ok } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (ok) return true;
  }
  return false;
}

/**
 * iOS / Android: Google-provided full-screen scanner UI (`scan()`).
 * Call after `isSupported()`, permissions, and (Android) module readiness.
 */
export async function runNativeGoogleScan(
  runtime: ScannerRuntimeOptions,
): Promise<UnifiedScanResult | null> {
  const { barcodes } = await BarcodeScanner.scan({
    formats: runtime.formats,
    autoZoom: true,
  });
  const b = barcodes[0];
  if (!b) return null;
  return toUnified(b, 'capacitor');
}

export interface StartScanParams {
  runtime?: Partial<ScannerRuntimeOptions>;
  videoElement?: HTMLVideoElement | null;
  onResult: (result: UnifiedScanResult) => void;
  onError?: (message: string) => void;
  onSessionEnd?: () => void;
}

/**
 * Web only: continuous scan with BarcodeDetector + camera stream.
 * Native apps should use `runNativeGoogleScan` instead.
 */
export async function startBarcodeScan(
  params: StartScanParams,
): Promise<() => Promise<void>> {
  if (Capacitor.isNativePlatform()) {
    throw new Error('startBarcodeScan is web-only; use runNativeGoogleScan on native.');
  }
  const runtime = mergeScannerRuntime(params.runtime);
  return startWeb(runtime, params);
}

async function startWeb(
  runtime: ScannerRuntimeOptions,
  params: StartScanParams,
): Promise<() => Promise<void>> {
  const video = params.videoElement;
  if (!video) {
    throw new Error('Web scan requires a video element (pass videoElement).');
  }
  const videoEl = video;

  const allow = createDuplicateGate(runtime);
  const onError = params.onError ?? (() => undefined);

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    });
  } catch (e) {
    const name = e instanceof DOMException ? e.name : '';
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      throw new Error('WEB_CAMERA_PERMISSION_DENIED');
    }
    throw e;
  }

  videoEl.srcObject = stream;
  videoEl.playsInline = true;
  await videoEl.play();

  const detector = new BarcodeDetector({
    formats: runtime.webFormats,
  });

  let raf = 0;
  let lastDetect = 0;
  let ended = false;

  function stopInternal(): Promise<void> {
    if (ended) return Promise.resolve();
    ended = true;
    cancelAnimationFrame(raf);
    for (const t of stream.getTracks()) {
      t.stop();
    }
    videoEl.srcObject = null;
    params.onSessionEnd?.();
    return Promise.resolve();
  }

  function scheduleFrame() {
    if (ended) return;
    raf = requestAnimationFrame(() => {
      void runFrame();
    });
  }

  async function runFrame(): Promise<void> {
    if (ended) return;
    const now = performance.now();
    if (now - lastDetect < runtime.webDetectIntervalMs) {
      scheduleFrame();
      return;
    }
    lastDetect = now;
    try {
      const codes = await detector.detect(videoEl);
      const c = codes[0];
      if (c) {
        const value = c.rawValue?.trim() ?? '';
        if (value && allow(value)) {
          params.onResult({
            value,
            displayValue: value,
            format: String(c.format),
            source: 'web',
          });
          if (runtime.singleShot) {
            await stopInternal();
            return;
          }
        }
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
    scheduleFrame();
  }

  scheduleFrame();

  return stopInternal;
}
