import { defineBoot } from '#q-app/wrappers';

import { useConnectionStore } from 'src/stores/connection';

export default defineBoot(() => {
  const connectionStore = useConnectionStore();
  connectionStore.startPingTimeout();
});
