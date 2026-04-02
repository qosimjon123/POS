<template>
  <section
    class="rp-email-section column items-center"
    aria-labelledby="email-login-heading"
  >
    <q-form class="rp-login-card column" @submit.prevent="onSubmit">
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
        color="primary"
        :dark="$q.dark.isActive"
        :label="t('login.loginLabel')"
        autocomplete="username"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
      />

      <q-input
        v-model="password"
        outlined
        class="rp-field"
        color="primary"
        :dark="$q.dark.isActive"
        :type="showPassword ? 'text' : 'password'"
        :label="t('login.passwordLabel')"
        autocomplete="current-password"
        :rules="[(val) => !!val || t('login.required')]"
        lazy-rules
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
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const showPassword = ref(false);

function onSubmit() {
  // Wire to auth API when ready
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

.rp-field :deep(.q-field__control) {
  min-height: 56px;
}

/* Тёмная тема: явный цвет ввода и лейбла (Quasar иначе может оставить тёмный текст на тёмном фоне) */
.rp-field :deep(.q-field__native),
.rp-field :deep(.q-field__native input) {
  color: var(--rp-foreground);
}

.rp-field :deep(.q-field__label) {
  color: var(--rp-muted-foreground);
}

.rp-field :deep(.q-field--focused .q-field__label),
.rp-field :deep(.q-field--highlighted .q-field__label),
.rp-field :deep(.q-field--float .q-field__label) {
  color: var(--rp-primary);
}

.rp-field :deep(.q-field__marginal) {
  color: var(--rp-muted-foreground);
}

/* Убирает «лишний» прямоугольник под outlined-полем при ошибке (конфликт слоёв/нижней зоны). */
.rp-field :deep(.q-field__bottom) {
  margin-top: 0;
  padding-top: 6px;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  outline: none;
}

.rp-field :deep(.q-field__messages) {
  line-height: 1.35;
}

.rp-sign-in-btn {
  font-size: 17px;
  font-weight: 600;
  min-height: 54px;
  padding: 14px 24px;
  /* Токены темы: на светлом — тёмная кнопка, в dark — светлая, чтобы не терялась на чёрном фоне */
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
