import { useOfflineStore } from '~/stores/offline';
import { useToast } from '~/composables/useToast';

export default defineNuxtPlugin(() => {
  const offline = useOfflineStore();
  const toast = useToast();
  offline.hydrate();

  async function syncNow(showToast = true) {
    if (!offline.pendingCount) return;
    const result = await offline.sync();
    if (result.synced && showToast) toast.success(`${result.synced} offline ${result.synced === 1 ? 'entry' : 'entries'} synced.`);
    if (result.failed) toast.warning(`${result.failed} offline ${result.failed === 1 ? 'entry needs' : 'entries need'} your attention.`, 'Could not sync');
  }

  window.addEventListener('online', () => { offline.setOnline(true); void syncNow(); });
  window.addEventListener('offline', () => { offline.setOnline(false); toast.info('You are offline. Sales and expenses will queue until you reconnect.'); });
  if (navigator.onLine) setTimeout(() => void syncNow(false), 1500);
});
