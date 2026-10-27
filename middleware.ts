import { next, rewrite } from '@vercel/functions';

declare const process: { env: Record<string, string | undefined> };

/**
 * Vercel Routing Middleware (runs before Nitro).
 *
 * Custom domains and {slug}.bossly.ng hosts are transparently rewritten to the
 * canonical /s/{slug} storefront route, so the customer keeps the clean host.
 * The Nuxt server middleware remains a redirect fallback for non-Vercel hosts.
 */
const RESERVED = [
  '/_nuxt', '/api', '/embed', '/s/', '/receipt', '/invoice', '/pay', '/payment',
  '/order', '/login', '/register', '/forgot-password', '/reset-password',
  '/verify-email', '/app', '/offline', '/favicon', '/pwa-', '/robots', '/sitemap',
  '/assets', '/sw.js', '/workbox', '/manifest', '/apple-touch', '/_ipx', '/__nuxt', '/_payload',
];

const cache = new Map<string, { slug: string; expires: number }>();

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (RESERVED.some((prefix) => path.startsWith(prefix))) return next();

  const forwarded = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const host = forwarded.split(',')[0].trim().split(':')[0].toLowerCase();
  if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) return next();

  const rootDomain = (process.env.NUXT_PUBLIC_ROOT_DOMAIN || 'bossly.ng').toLowerCase();
  if (host === rootDomain || host === `www.${rootDomain}`) return next();

  let slug: string | null = null;
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, -(rootDomain.length + 1));
    if (sub && sub !== 'www' && sub !== 'app' && sub !== 'admin' && !sub.includes('.')) slug = sub;
  } else {
    const cached = cache.get(host);
    if (cached && cached.expires > Date.now()) {
      slug = cached.slug;
    } else {
      try {
        const apiBase = String(process.env.NUXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
        if (!apiBase) return next();
        const response = await fetch(`${apiBase}/storefront/domain/${encodeURIComponent(host)}`, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) return next();
        const payload = (await response.json()) as { data?: { business?: { slug?: string } } };
        slug = payload.data?.business?.slug || null;
        if (slug) cache.set(host, { slug, expires: Date.now() + 5 * 60 * 1000 });
      } catch {
        return next();
      }
    }
  }

  if (!slug) return next();
  const target = new URL(request.url);
  target.pathname = `/s/${slug}${path === '/' ? '' : path}`;
  return rewrite(target);
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_nuxt|_ipx|__nuxt|_payload|assets|api|embed|s/|receipt|invoice|pay|payment|order|login|register|forgot-password|reset-password|verify-email|app|offline|favicon|pwa-|robots|sitemap|manifest|apple-touch|sw\\.js|workbox).*)'],
};
