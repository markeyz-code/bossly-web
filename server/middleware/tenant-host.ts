const RESERVED_PREFIXES = [
  '/s/', '/_nuxt', '/api', '/embed', '/receipt', '/invoice', '/pay', '/payment', '/order',
  '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/app',
  '/offline', '/favicon', '/pwa-', '/robots', '/sitemap', '/manifest', '/apple-touch', '/__nuxt', '/_payload', '/assets', '/_ipx',
];
const cache = new Map<string, { slug: string; expires: number }>();

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  if (RESERVED_PREFIXES.some((prefix) => path.startsWith(prefix))) return;
  const forwardedHost = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host');
  if (!forwardedHost) return;
  const host = forwardedHost.split(',')[0].trim().split(':')[0].toLowerCase();
  if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) return;
  const config = useRuntimeConfig(event);
  const rootDomain = String(config.public.rootDomain || 'bossly.ng').toLowerCase();
  let slug: string | null = null;

  if (host === rootDomain || host === `www.${rootDomain}`) return;
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, -(rootDomain.length + 1));
    if (sub && sub !== 'www' && sub !== 'app' && sub !== 'admin' && !sub.includes('.')) slug = sub;
  } else {
    const cached = cache.get(host);
    if (cached && cached.expires > Date.now()) slug = cached.slug;
    else {
      try {
        const data = await $fetch<{ data: { business: { slug: string } } }>(
          `${String(config.public.apiBase).replace(/\/$/, '')}/storefront/domain/${encodeURIComponent(host)}`,
          { timeout: 5000 },
        );
        slug = data?.data?.business?.slug || null;
        if (slug) cache.set(host, { slug, expires: Date.now() + 5 * 60 * 1000 });
      } catch {
        return;
      }
    }
  }
  if (!slug) return;
  // On Vercel, apps/web-app/middleware.ts performs a clean edge rewrite to the
  // same path. Other hosts fall back to a redirect because Nitro has already
  // resolved the page route by the time this middleware runs.
  return sendRedirect(event, `/s/${slug}${path === '/' ? '' : path}${url.search}`, 302);
});
