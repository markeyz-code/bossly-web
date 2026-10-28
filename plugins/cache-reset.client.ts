/**
 * Removes pre-rebrand service-worker caches once per release.
 * The version is intentionally bumped with each deploy.
 */
const BUILD_ID = 'ojaly-2026-10-28-carousel-v2';
const STORAGE_KEY = 'ojaly:build';

export default defineNuxtPlugin(() => {
  if (import.meta.server || typeof window === 'undefined') return;

  void (async () => {
    try {
      const previous = localStorage.getItem(STORAGE_KEY);
      if (previous === BUILD_ID) return;
      localStorage.setItem(STORAGE_KEY, BUILD_ID);

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if (previous) window.location.reload();
    } catch {
      // A blocked storage or cache API must never stop the app from rendering.
    }
  })();
});
