import { useAuthStore } from '~/stores/auth';
import { useBusinessStore } from '~/stores/business';
import { useCartStore } from '~/stores/cart';
import { useOfflineStore } from '~/stores/offline';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  const business = useBusinessStore();
  const cart = useCartStore();
  const offline = useOfflineStore();
  cart.hydrate();
  offline.hydrate();
  await auth.hydrate();

  window.addEventListener('bossly:session-expired', () => {
    auth.clearSession();
    business.reset();
    if (!window.location.pathname.startsWith('/login')) {
      void navigateTo(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  });
  window.addEventListener('bossly:auth-refreshed', () => {
    if (auth.user) void auth.fetchMe().catch(() => undefined);
  });
});
