import { defineBoot } from '#q-app/wrappers';

import { configureFrappeStatusHandler } from 'src/api/frappeClient/statusAdapter';
import { useConnectionStore } from 'src/stores/connection';

export default defineBoot(() => {
  const connectionStore = useConnectionStore();
  configureFrappeStatusHandler((status) => {
    connectionStore.handleFrappeRequestStatus(status);
  });
  connectionStore.startPingTimeout();
});
