import { setupHttp } from '~/config/axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  setupHttp(config.public.apiBase);
});
