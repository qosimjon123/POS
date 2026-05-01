import { Notify } from 'quasar';

import { getFrappeCall } from '../frappeClient/backendClient';
import { METHODS } from 'src/config/storage';
import { i18n } from 'src/i18n';

type SuccessResponse = { 
    message: { 
        encrypted_qr: string 
    } 
};

/** Тело от whitelist: может быть `{ message: { encrypted_qr } }` или прямой объект по версии API. */
export async function getQrData(pin_code: string): Promise<string | null> {
    const frappe = getFrappeCall();
    if (!frappe) {
        Notify.create({
        message: String(i18n.global.t('login.frappeNotInitialized')),
        color: 'negative',
        timeout: 3000,
        });
        return null;
    }
    try {
        const result = await frappe.post<SuccessResponse>(METHODS.GENERATE_QR, { pin_code: pin_code });  
        return result.message.encrypted_qr;

    } catch(e: unknown) {
        Notify.create({
            message: String(i18n.global.t((e as { exc_type?: string }).exc_type ?? 'login.signInFailed')),
            color: 'negative',
            timeout: 3000,
        });
        return null;
    }
}
