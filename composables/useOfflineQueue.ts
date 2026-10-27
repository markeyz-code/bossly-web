import { useOfflineStore } from '~/stores/offline';

/** The offline queue is global state. Return the Pinia store so it stays reactive. */
export function useOfflineQueue() {
  return useOfflineStore();
}
