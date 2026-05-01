import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';
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

const supported = ref(false);
const scanning = ref(false);
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
  ): Promise<UnifiedScanResult | null> {
    if (!Capacitor.isNativePlatform() && scanning.value && stopSession) {
      await stopSession();
      stopSession = null;
    }

    errorMessage.value = null;
    scanning.value = true;

    const runtime = mergeScannerRuntime(runtimeOverride);

    try {
      if (Capacitor.isNativePlatform()) {
        const { supported: ok } = await BarcodeScanner.isSupported();
        if (!ok) {
          notifyNotSupported();
          return null;
        }

        const permOk = await ensureNativeScannerPermissions();
        if (!permOk) {
          notifyPermissionDenied();
          return null;
        }

        if (Capacitor.getPlatform() === 'android') {
          const moduleOk = await ensureAndroidGoogleScanModule();
          if (!moduleOk) {
            notifyGoogleModuleUnavailable();
            return null;
          }
        }

        return await runNativeGoogleScan(runtime);
      }

      await nextTick();

      webPreviewVideoTarget.value = null;

      const webPerm = await ensureWebCameraPermission();
      if (!webPerm) {
        notifyWebCameraDenied();
        return null;
      }

      const resolved =
        videoElement !== undefined && videoElement !== null
          ? videoElement
          : defaultWebScanVideo.value;
      if (!resolved) {
        errorMessage.value = i18n.global.t('scanner.unexpectedError');
        return null;
      }

      webPreviewVideoTarget.value = resolved;

      return await new Promise<UnifiedScanResult | null>((resolve) => {
        let settled = false;
        const settle = (result: UnifiedScanResult | null) => {
          if (settled) return;
          settled = true;
          resolve(result);
        };

        void startBarcodeScan({
          ...(runtimeOverride ? { runtime: runtimeOverride } : {}),
          videoElement: resolved,
          onResult: (r) => {
            settle(r);
            void stopScan();
          },
          onError: () => {
            errorMessage.value = i18n.global.t('scanner.unexpectedError');
          },
          onSessionEnd: () => {
            scanning.value = false;
            stopSession = null;
            webPreviewVideoTarget.value = null;
            settle(null);
          },
        })
          .then((stop) => {
            stopSession = stop;
          })
          .catch((e: unknown) => {
            webPreviewVideoTarget.value = null;
            const msg = e instanceof Error ? e.message : String(e);
            if (msg === 'WEB_CAMERA_PERMISSION_DENIED') {
              notifyWebCameraDenied();
            } else {
              errorMessage.value = i18n.global.t('scanner.unexpectedError');
            }
            scanning.value = false;
            settle(null);
          });
      });
    } catch {
      errorMessage.value = i18n.global.t('scanner.unexpectedError');
      return null;
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

  function resetRuntimeState() {
    errorMessage.value = null;
    void stopScan();
  }

  async function scanFromFile(
    file: File,
    runtimeOverride?: Partial<ScannerRuntimeOptions>,
  ): Promise<UnifiedScanResult | null> {
    errorMessage.value = null;
    try {
      const result = await readBarcodeFromImageFile(file, runtimeOverride);
      if (result) {
        return result;
      } else {
        errorMessage.value = i18n.global.t('scanner.fileNoBarcode');
      }
    } catch {
      errorMessage.value = i18n.global.t('scanner.fileReadError');
    }
    return null;
  }

export function useScanner() {
  return {
    get supported() {
      return supported.value;
    },
    get scanning() {
      return scanning.value;
    },
    get errorMessage() {
      return errorMessage.value;
    },
    get needsVideoPreview() {
      return needsVideoPreview.value;
    },
    get defaultWebScanVideo() {
      return defaultWebScanVideo.value;
    },
    webPreviewVideoTarget,
    init,
    startScan,
    stopScan,
    resetRuntimeState,
    scanFromFile,
    setDefaultWebScanVideo,
  };
}
