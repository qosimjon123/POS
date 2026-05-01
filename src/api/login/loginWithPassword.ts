import { getFrappeCall } from '../frappeClient/backendClient';
import { Notify } from 'quasar';
import { METHODS } from 'src/config/storage';
import { i18n } from 'src/i18n';
import { useLoginStore } from 'src/stores/login';

type LoginSuccessResponse = {
    message: {
        token: string;
    };
};

/** @returns `true` только после успешного сохранения токена; иначе `false` (ошибка уже показана через Notify). */
export async function loginWithPassword(
    emailValue: string,
    passwordValue: string,
    ): Promise<boolean> {
    const frappe = getFrappeCall();
    if (!frappe) {
        Notify.create({
        message: String(i18n.global.t('login.frappeNotInitialized')),
        color: 'negative',
        timeout: 3000,
        });
        return false;
    }
    try {
        const result = await frappe.post<LoginSuccessResponse>(METHODS.LOGIN, {
        usr: emailValue.trim(),
        pwd: passwordValue,
        });
        const authToken = result.message.token;
        if (!authToken) {
            return false;
        }
        await useLoginStore().setToken(authToken);
        return true;
    } catch (e: unknown) {
        Notify.create({
            message: String(i18n.global.t((e as { exc_type?: string }).exc_type ?? 'login.signInFailed')),
            color: 'negative',
            timeout: 3000,
        });
        return false;
    }
}
