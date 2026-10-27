export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return;
  const auth = useAuthStore();
  await auth.ensureReady();
  const isApp = to.path.startsWith('/app');
  const guestOnly = ['/login', '/register'].includes(to.path);
  if (isApp && !auth.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
  if (guestOnly && auth.isAuthenticated) return navigateTo('/app');
});
