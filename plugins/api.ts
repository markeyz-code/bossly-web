import { setupHttp } from '~/config/axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  let apiBase = String(config.public.apiBase || '').replace(/\/$/, '');

  if (import.meta.client && typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && (!apiBase || apiBase.includes('localhost') || apiBase.includes('127.0.0.1'))) {
      apiBase = 'https://api.ojaly.org/api/v1';
    }
  }

  setupHttp(apiBase || 'https://api.ojaly.org/api/v1');
});
