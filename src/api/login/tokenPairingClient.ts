import { callFrappeMethod } from 'src/api/frappeClient/rpcClient';

const GET_QR = 'fadl_pos.api.login.login_with_qr.get_qr_data';

interface TokenPairingQrResponse {
  message?: {
    encrypted_blob?: unknown;
  };
  encrypted_blob?: unknown;
}

export async function requestTokenPairingQr(payload: {
  login: string;
  password: string;
  pin_code: string;
}): Promise<string | null> {
  const res = await callFrappeMethod<TokenPairingQrResponse>(GET_QR, payload);
  const blob = res?.message?.encrypted_blob ?? res?.encrypted_blob;
  return typeof blob === 'string' && blob ? blob : null;
}
