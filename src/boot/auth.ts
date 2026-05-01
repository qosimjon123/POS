import { defineBoot } from '#q-app/wrappers';
import { configureFrappeSessionRecovery } from 'src/api/frappeClient/frappeSessionInterceptor';
import { resetFrappeApp } from 'src/api/frappeClient/backendClient';
import { useLoginStore } from 'src/stores/login';

export default defineBoot(async ({ store, router }) => {
  const loginStore = useLoginStore(store);

  configureFrappeSessionRecovery({
    clearSession: async () => {
      await loginStore.clearToken();
      resetFrappeApp();
    },
    navigateToLogin: () => {
      const route = router.currentRoute.value;
      if (route.name === 'login') return;
      void router.replace({
        name: 'login',
        query: { redirect: route.fullPath },
      });
    },
  });

  await loginStore.hydrateTokenFromStorage();
});
