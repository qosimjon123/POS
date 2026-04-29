import { defineBoot } from '#q-app/wrappers';

import { configureFrappeAuthFailureHandler } from 'src/api/frappeClient/authSessionAdapter';
import { useLoginStore } from 'src/stores/login';
import { useRegisterContextStore } from 'src/stores/register-context';

export default defineBoot(({ router, store }) => {
  configureFrappeAuthFailureHandler(() => {
    const loginStore = useLoginStore(store);
    const registerStore = useRegisterContextStore(store);

    loginStore.handleAuthFailure();
    registerStore.clearSelection();

    const current = router.currentRoute.value;
    if (current.meta.public || current.name === 'login') return;

    void router.replace({
      name: 'login',
      query: { redirect: current.fullPath },
    });
  });
});
