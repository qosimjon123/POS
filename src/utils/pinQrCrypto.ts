/** Только для UI страницы «Ключ и QR» (скрытие QR с экрана); в шифротексте срока нет. */
export const TOKEN_QR_TTL_MS = 60_000;

const enc = new TextEncoder();

function toB64(u8: Uint8Array): string {
  let bin = '';
  u8.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function fromB64(s: string): Uint8Array | null {
  try {
    const bin = atob(s);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  } catch {
    return null;
  }
}

/** SubtleCrypto typings expect `ArrayBuffer`-backed views, not `ArrayBufferLike`. */
function asBufferSource(u8: Uint8Array): BufferSource {
  const buf = new ArrayBuffer(u8.byteLength);
  const out = new Uint8Array(buf);
  out.set(u8);
  return out;
}

export type TokenQrPayloadV1 = {
  v: 1;
  salt: string;
  iv: string;
  data: string;
};

/** Сырой текст QR — наш конверт v1 (без проверки подписи). */
export function isPairingQrEnvelope(raw: string): boolean {
  try {
    const o = JSON.parse(raw) as Partial<TokenQrPayloadV1>;
    return (
      o.v === 1 &&
      typeof o.salt === 'string' &&
      typeof o.iv === 'string' &&
      typeof o.data === 'string' &&
      o.salt.length > 0 &&
      o.iv.length > 0 &&
      o.data.length > 0
    );
  } catch {
    return false;
  }
}

function parseDecryptedPlaintext(text: string): string | null {
  const s = text.trim();
  if (!s) return null;
  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s) as { t?: unknown };
      if (o && typeof o === 'object' && typeof o.t === 'string' && o.t.length > 0) {
        return o.t;
      }
    } catch {
      /* не JSON — считаем всю строку токеном */
    }
  }
  return s;
}

/**
 * Собирает QR: внутри — непрозрачная строка (серверный ключ как есть), снаружи — AES-GCM,
 * ключ PBKDF2 от **6-значного PIN** (на втором устройстве достаточно QR + PIN).
 */
export async function buildEncryptedQrPayload(
  serverToken: string,
  pin6: string,
): Promise<string> {
  const plaintext = enc.encode(serverToken);

  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const pinMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin6),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    pinMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plaintext,
  );

  const bundle: TokenQrPayloadV1 = {
    v: 1,
    salt: toB64(salt),
    iv: toB64(iv),
    data: toB64(new Uint8Array(ciphertext)),
  };

  return JSON.stringify(bundle);
}

export type DecryptedPairingResult = { token: string };

/**
 * Расшифровка после скана QR: верный PIN → токен; неверный PIN → null.
 * Старые QR с JSON `{"t":"..."}` внутри по-прежнему читаются (поле `t`).
 */
export async function tryDecryptPairingQr(
  qrRaw: string,
  pin6: string,
): Promise<DecryptedPairingResult | null> {
  if (!isPairingQrEnvelope(qrRaw)) return null;

  let bundle: TokenQrPayloadV1;
  try {
    bundle = JSON.parse(qrRaw) as TokenQrPayloadV1;
  } catch {
    return null;
  }

  const salt = fromB64(bundle.salt);
  const iv = fromB64(bundle.iv);
  const ciphertext = fromB64(bundle.data);
  if (!salt || !iv || !ciphertext) return null;

  const saltBuf = asBufferSource(salt);
  const ivBuf = asBufferSource(iv);
  const cipherBuf = asBufferSource(ciphertext);

  const pinMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin6),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    pinMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  try {
    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuf },
      aesKey,
      cipherBuf,
    );
    const text = new TextDecoder().decode(plainBuf);
    const token = parseDecryptedPlaintext(text);
    if (!token) return null;
    return { token };
  } catch {
    return null;
  }
}
