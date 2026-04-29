import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';
import { defineStore } from 'pinia';
import { computed, nextTick, ref, shallowRef } from 'vue';

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

export type ScannerIntent = 'login' | 'catalog' | 'customer' | 'customerCreate';

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
  const lastIntent = ref<ScannerIntent | null>(null);
  const errorMessage = ref<string | null>(null);
  let stopSession: (() => Promise<void>) | null = null;

  /** Шапка POS регистрирует `<video>`; пикер клиента может вызвать скан без своего элемента. */
  const defaultWebScanVideo = shallowRef<HTMLVideoElement | null>(null);
  /** Какой `<video>` сейчас получает stream (чтобы не показывать два полноэкранных превью). */
  const webPreviewVideoTarget = shallowRef<HTMLVideoElement | null>(null);

  const needsVideoPreview = computed(
    () => !Capacitor.isNativePlatform() && scanning.value,
  );

  function setDefaultWebScanVideo(el: HTMLVideoElement | null) {
    defaultWebScanVideo.value = el;
  }

  function setResult(result: UnifiedScanResult, intent: ScannerIntent | null) {
    lastIntent.value = intent;
    lastResult.value = result;
  }

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
    intent: ScannerIntent = 'catalog',
  ) {
    if (!Capacitor.isNativePlatform() && scanning.value && stopSession) {
      await stopSession();
      stopSession = null;
    }

    lastResult.value = null;
    lastIntent.value = intent;
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
        if (result) setResult(result, intent);
        return;
      }

      await nextTick();

      webPreviewVideoTarget.value = null;

      const webPerm = await ensureWebCameraPermission();
      if (!webPerm) {
        notifyWebCameraDenied();
        return;
      }

      const resolved =
        videoElement !== undefined && videoElement !== null
          ? videoElement
          : defaultWebScanVideo.value;
      if (!resolved) {
        errorMessage.value = i18n.global.t('scanner.unexpectedError');
        return;
      }

      webPreviewVideoTarget.value = resolved;

      try {
        stopSession = await startBarcodeScan({
          ...(runtimeOverride ? { runtime: runtimeOverride } : {}),
          videoElement: resolved,
          onResult: (r) => {
            setResult(r, intent);
          },
          onError: () => {
            errorMessage.value = i18n.global.t('scanner.unexpectedError');
          },
          onSessionEnd: () => {
            scanning.value = false;
            stopSession = null;
            webPreviewVideoTarget.value = null;
          },
        });
      } catch (e) {
        webPreviewVideoTarget.value = null;
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
    webPreviewVideoTarget.value = null;
  }

  function clearLastResult() {
    lastResult.value = null;
    lastIntent.value = null;
  }

  async function scanFromFile(
    file: File,
    runtimeOverride?: Partial<ScannerRuntimeOptions>,
    intent: ScannerIntent = 'login',
  ) {
    errorMessage.value = null;
    try {
      const result = await readBarcodeFromImageFile(file, runtimeOverride);
      if (result) {
        setResult(result, intent);
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
    lastIntent,
    errorMessage,
    needsVideoPreview,
    defaultWebScanVideo,
    webPreviewVideoTarget,
    init,
    startScan,
    stopScan,
    clearLastResult,
    scanFromFile,
    setDefaultWebScanVideo,
  };
});
