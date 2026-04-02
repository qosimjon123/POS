import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';
import { defineStore } from 'pinia';
import { computed, nextTick, ref } from 'vue';

import { i18n } from 'src/i18n';
import {
  mergeScannerRuntime,
  type ScannerRuntimeOptions,
} from 'src/config/scanner';
import {
  ensureAndroidGoogleScanModule,
  ensureNativeScannerPermissions,
  ensureWebCameraPermission,
  runNativeGoogleScan,
  startBarcodeScan,
} from 'src/modules/scanner/scan-session';
import { readBarcodeFromImageFile } from 'src/modules/scanner/read-from-file';
import type { UnifiedScanResult } from 'src/modules/scanner/types';

type ScannerNotifyOpts = QNotifyCreateOptions & {
  /** Tap banner to dismiss (off when you pass custom `actions`, e.g. «Настройки»). */
  dismissOnBannerClick?: boolean;
};

function scannerNotify(opts: ScannerNotifyOpts) {
  const { dismissOnBannerClick = true, ...rest } = opts;
  const hasCustomActions =
    Array.isArray(rest.actions) && rest.actions.length > 0;
  const dismiss = Notify.create({
    position: 'top',
    closeBtn: '×',
    ...rest,
    attrs: {
      role: 'alert',
      ...rest.attrs,
      ...(dismissOnBannerClick && !hasCustomActions
        ? {
            style: 'cursor: pointer',
            onClick: () => dismiss(),
          }
        : {}),
    },
  });
  return dismiss;
}

function notifyPermissionDenied() {
  const t = i18n.global.t;
  scannerNotify({
    type: 'negative',
    message: t('scanner.noCameraAccess'),
    caption: t('scanner.cameraPermissionHint'),
    timeout: 8000,
    dismissOnBannerClick: false,
    actions: [
      {
        label: t('scanner.openSettings'),
        color: 'white',
        handler: () => {
          void BarcodeScanner.openSettings();
        },
      },
    ],
  });
}

function notifyWebCameraDenied() {
  const t = i18n.global.t;
  scannerNotify({
    type: 'negative',
    message: t('scanner.browserCameraDenied'),
    timeout: 8000,
  });
}

function notifyNotSupported() {
  const t = i18n.global.t;
  scannerNotify({
    type: 'negative',
    message: t('scanner.notSupportedOnDevice'),
    timeout: 6000,
  });
}

function notifyGoogleModuleUnavailable() {
  const t = i18n.global.t;
  scannerNotify({
    type: 'warning',
    message: t('scanner.googleModuleUnavailable'),
    timeout: 8000,
  });
}

export const useScannerStore = defineStore('scanner', () => {
  const supported = ref(false);
  const scanning = ref(false);
  const lastResult = ref<UnifiedScanResult | null>(null);
  const errorMessage = ref<string | null>(null);
  let stopSession: (() => Promise<void>) | null = null;

  const needsVideoPreview = computed(
    () => !Capacitor.isNativePlatform() && scanning.value,
  );

  async function init() {
    errorMessage.value = null;
    if (Capacitor.isNativePlatform()) {
      const { supported: s } = await BarcodeScanner.isSupported();
      supported.value = s;
    } else {
      supported.value = !!(
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
      );
    }
  }

  async function startScan(
    videoElement?: HTMLVideoElement | null,
    runtimeOverride?: Partial<ScannerRuntimeOptions>,
  ) {
    if (!Capacitor.isNativePlatform() && scanning.value && stopSession) {
      await stopSession();
      stopSession = null;
    }

    lastResult.value = null;
    errorMessage.value = null;
    scanning.value = true;

    const runtime = mergeScannerRuntime(runtimeOverride);

    try {
      if (Capacitor.isNativePlatform()) {
        const { supported: ok } = await BarcodeScanner.isSupported();
        if (!ok) {
          notifyNotSupported();
          return;
        }

        const permOk = await ensureNativeScannerPermissions();
        if (!permOk) {
          notifyPermissionDenied();
          return;
        }

        if (Capacitor.getPlatform() === 'android') {
          const moduleOk = await ensureAndroidGoogleScanModule();
          if (!moduleOk) {
            notifyGoogleModuleUnavailable();
            return;
          }
        }

        const result = await runNativeGoogleScan(runtime);
        if (result) lastResult.value = result;
        return;
      }

      await nextTick();

      const webPerm = await ensureWebCameraPermission();
      if (!webPerm) {
        notifyWebCameraDenied();
        return;
      }

      try {
        stopSession = await startBarcodeScan({
          ...(runtimeOverride ? { runtime: runtimeOverride } : {}),
          videoElement: videoElement ?? null,
          onResult: (r) => {
            lastResult.value = r;
          },
          onError: () => {
            errorMessage.value = i18n.global.t('scanner.unexpectedError');
          },
          onSessionEnd: () => {
            scanning.value = false;
            stopSession = null;
          },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === 'WEB_CAMERA_PERMISSION_DENIED') {
          notifyWebCameraDenied();
        } else {
          errorMessage.value = i18n.global.t('scanner.unexpectedError');
        }
      }
    } catch {
      errorMessage.value = i18n.global.t('scanner.unexpectedError');
    } finally {
      if (Capacitor.isNativePlatform()) {
        scanning.value = false;
      } else if (!stopSession) {
        scanning.value = false;
      }
    }
  }

  async function stopScan() {
    if (Capacitor.isNativePlatform()) {
      return;
    }
    if (stopSession) {
      await stopSession();
      stopSession = null;
    }
    scanning.value = false;
  }

  function clearLastResult() {
    lastResult.value = null;
  }

  async function scanFromFile(
    file: File,
    runtimeOverride?: Partial<ScannerRuntimeOptions>,
  ) {
    errorMessage.value = null;
    try {
      const result = await readBarcodeFromImageFile(file, runtimeOverride);
      if (result) {
        lastResult.value = result;
      } else {
        errorMessage.value = i18n.global.t('scanner.fileNoBarcode');
      }
    } catch {
      errorMessage.value = i18n.global.t('scanner.fileReadError');
    }
  }

  return {
    supported,
    scanning,
    lastResult,
    errorMessage,
    needsVideoPreview,
    init,
    startScan,
    stopScan,
    clearLastResult,
    scanFromFile,
  };
});
