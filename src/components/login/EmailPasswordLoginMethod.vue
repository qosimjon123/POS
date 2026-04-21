<template>
  <section
    class="rp-email-section column items-center"
    aria-labelledby="email-login-heading"
  >
    <q-form class="rp-login-card column" @submit.prevent="onSubmit" autocomplete="off">
      <div class="q-mb-sm">
        <h2 id="email-login-heading" class="rp-login-title">
          {{ t('login.standardLogin') }}
        </h2>
        <p class="rp-login-subtitle">{{ t('login.standardLoginSubtitle') }}</p>
      </div>

      <q-input
        v-model="email"
        outlined
        class="rp-field"
        :color="!$q.dark.isActive ? 'dark' : 'light'"
        :text-color="!$q.dark.isActive ? 'dark' : 'light'"
        :label="t('login.loginLabel')"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
        @focus="onFieldFocus('email')"
        @blur="onFieldBlur"
      />

      <q-input
        v-model="password"
        outlined
        class="rp-field"
        :color="$q.dark.isActive ? 'dark' : 'light'"
        :text-color="$q.dark.isActive ? 'dark' : 'light'"
        :type="showPassword ? 'text' : 'password'"
        :label="t('login.passwordLabel')"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
        @focus="onFieldFocus('password')"
        @blur="onFieldBlur"
      >
        <template #append>
          <q-btn
            flat
            dense
            round
            :icon="showPassword ? 'visibility_off' : 'visibility'"
            :aria-label="showPassword ? t('login.hidePassword') : t('login.showPassword')"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-btn
        unelevated
        no-caps
        class="rp-sign-in-btn full-width q-mt-md"
        :label="t('login.signIn')"
        type="submit"
      />
    </q-form>

    <div class="rp-admin-note row items-center justify-center q-mt-xl">
      <q-icon name="vpn_key" size="20px" class="rp-icon-muted q-mr-sm" />
      <span>{{ t('login.adminNote') }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useRpKeyboard } from 'src/components/common/keyboard-inject';
import { useLoginStore } from 'src/stores/login';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const login = useLoginStore();
const { email, password, showPassword } = storeToRefs(login);

const kbd = useRpKeyboard();

function onFieldFocus(field: 'email' | 'password') {
  if (field === 'email') {
    kbd.bindInput(
      () => email.value,
      (v) => {
        email.value = v;
      },
    );
  } else {
    kbd.bindInput(
      () => password.value,
      (v) => {
        password.value = v;
      },
    );
  }
  kbd.open();
}

function onFieldBlur() {
  kbd.close();
  kbd.resetBinding();
}

async function onSubmit() {
  if (!email.value?.trim() || !password.value) return;

  if (login.hasFrappeBackend) {
    try {
      await login.loginWithFrappe(email.value, password.value);
    } catch (e: unknown) {
      let msg = t('login.signInFailed');
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        if (typeof data?.message === 'string' && data.message.trim()) {
          msg = data.message;
        }
      } else if (e instanceof Error && e.message) {
        msg = e.message;
      }
      $q.notify({ type: 'negative', message: msg });
      return;
    }
  }

  void router.push({ name: 'register-select' });
}
</script>

<style scoped lang="scss">
.rp-email-section {
  width: 100%;
}

.rp-login-card {
  width: 100%;
  max-width: 540px;
  background: var(--rp-card);
  border-radius: 12px;
  padding: 48px;
  gap: 16px;
}

.rp-login-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--rp-foreground);
}

.rp-login-subtitle {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--rp-muted-foreground);
  line-height: 1.5;
}

.rp-sign-in-btn {
  font-size: 17px;
  font-weight: 600;
  min-height: 54px;
  padding: 14px 24px;
  background: var(--rp-primary) !important;
  color: var(--rp-primary-foreground) !important;
}

.rp-sign-in-btn :deep(.q-btn__wrapper) {
  min-height: 48px;
  padding: 0 8px;
}

.rp-sign-in-btn :deep(.q-focus-helper) {
  background: currentColor;
  opacity: 0.12;
}

.rp-sign-in-btn:hover,
.rp-sign-in-btn:focus-visible {
  filter: brightness(1.08);
}

.rp-admin-note {
  font-size: 15px;
  font-weight: 500;
  color: var(--rp-muted-foreground);
  line-height: 1.5;
  max-width: 540px;
  text-align: center;
}

.rp-icon-muted {
  color: var(--rp-muted-foreground);
}
</style>
