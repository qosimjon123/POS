<template>
  <div class="rp-pin-card column">
    <div class="rp-pin-head">
      <div class="rp-pin-title-wrap">
        <p class="rp-pin-title">
          {{
            loginQrCaptured ? t('login.pinEnterTitle') : t('login.pinLockedTitle')
          }}
        </p>
      </div>
      <div class="rp-lock-badge flex flex-center">
        <q-icon name="lock" size="24px" class="rp-icon-muted" />
      </div>
    </div>

    <div class="rp-pin-dots row justify-center">
      <span
        v-for="i in 6"
        :key="i"
        class="rp-pin-dot"
        :class="{
          'rp-pin-dot--filled': loginQrCaptured && pin.length >= i,
        }"
      />
    </div>

    <RpNumericTouchpad
      v-model="pin"
      class="rp-pin-numpad"
      :disabled="!loginQrCaptured || verifying"
      :max-length="6"
      size="lg"
      shape="circle"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import RpNumericTouchpad from 'src/components/common/RpNumericTouchpad.vue';
import { useLoginStore } from 'src/stores/login';
import { loginWithQR } from 'src/api/login/loginWithQR';

const { t } = useI18n();
const router = useRouter();
const login = useLoginStore();
const { pin, qrLoginPayload, loginQrCaptured } = storeToRefs(login);

const verifying = ref(false);

watch(pin, async (p) => {
  if (p.length !== 6 || !loginQrCaptured.value || verifying.value) return;
  const raw = qrLoginPayload.value.trim();
  if (!raw) return;

  verifying.value = true;
  try {
    const ok = await loginWithQR(raw, pin.value);
    if (!ok) {
      login.setPin('');
      return;
    }

    login.resetQrLoginPairing();
    void router.push({ name: 'register-select' });
  } finally {
    verifying.value = false;
  }
});
</script>

<style scoped lang="scss">
.rp-pin-card {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  background: var(--rp-muted);
  border-radius: 12px;
  padding: 46px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.rp-pin-head {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 38px;
  min-width: 0;
}

.rp-pin-title-wrap {
  flex: 1 1 0;
  min-width: 0;
}

.rp-pin-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--rp-foreground);
  margin: 0;
  line-height: 1.35;
  overflow-wrap: anywhere;
  hyphens: auto;
}

.rp-lock-badge {
  flex-shrink: 0;
  width: 46px;
  min-width: 46px;
  height: 46px;
  border-radius: 23px;
  background: var(--rp-card);
}

.rp-pin-dots {
  flex-wrap: wrap;
  gap: clamp(8px, 3vw, 20px);
  margin-bottom: 42px;
  opacity: 0.55;
}

.rp-pin-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--rp-muted-foreground);
  background: transparent;
}

.rp-pin-dot--filled {
  background: var(--rp-foreground);
  border-color: var(--rp-foreground);
}

.rp-pin-numpad {
  margin-top: auto;
}

.rp-icon-muted {
  color: var(--rp-muted-foreground);
}

@media (max-width: 480px) {
  .rp-pin-card {
    padding: 24px 16px;
  }

  .rp-pin-head {
    margin-bottom: 28px;
  }
}
</style>
