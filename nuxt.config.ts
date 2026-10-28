const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.RAILWAY_ENVIRONMENT) || Boolean(process.env.RENDER);
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const publicApiBase = process.env.NUXT_PUBLIC_API_BASE || (isProd ? 'https://api.ojaly.org/api/v1' : 'http://localhost:4100/api/v1');
const publicAppUrl = process.env.NUXT_PUBLIC_APP_URL || vercelUrl || (isProd ? 'https://ojaly.org' : 'http://localhost:3100');
const publicAdminUrl = process.env.NUXT_PUBLIC_ADMIN_URL || (isProd ? 'https://admin.ojaly.org' : 'http://localhost:3101');

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: [
    '@fontsource-variable/space-grotesk/index.css',
    '@fontsource-variable/dm-sans/index.css',
    '@fontsource-variable/fraunces/index.css',
    '@fontsource-variable/bricolage-grotesque/index.css',
    '~/assets/css/main.css',
  ],
  runtimeConfig: {
    public: {
      apiBase: publicApiBase,
      appUrl: publicAppUrl,
      rootDomain: process.env.NUXT_PUBLIC_ROOT_DOMAIN || 'ojaly.org',
      paystackPublicKey: process.env.NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      adminUrl: publicAdminUrl,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en-NG' },
      title: 'Ojaly — run your business. Know your money.',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#06231A' },
        { name: 'description', content: 'Ojaly is the operating system for ambitious Nigerian businesses. Track real profit, stock, debts and expenses — and turn your catalogue into a free storefront.' },
        { property: 'og:site_name', content: 'Ojaly' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://ojaly.org/images/business/market-trader.webp' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/pwa-192.png' },
      ],
    },
  },
  tailwindcss: { cssPath: '~/assets/css/main.css', configPath: '~/tailwind.config.ts', viewer: false },
  routeRules: {
    '/app/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/receipt/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/invoice/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/order/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/pay/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/payment/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/impersonate': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/embed/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/forgot-password': { ssr: false },
    '/reset-password': { ssr: false },
    '/verify-email': { ssr: false },
    '/offline': { prerender: true },
    '/s/**/cart': { ssr: false },
    '/s/**/checkout': { ssr: false },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Ojaly — business, handled',
      short_name: 'Ojaly',
      description: 'Run your business, know your money and get a free website.',
      theme_color: '#06231A',
      background_color: '#FBF7EF',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/app',
      scope: '/',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/[^/]+\/(?!api\/|_nuxt\/|__nuxt|embed\/|sw\.js|workbox|favicon|pwa-|.*\.[a-z0-9]{2,5}(?:\?|$)).*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'ojaly-pages',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 40, maxAgeSeconds: 86400 },
            precacheFallback: { fallbackURL: '/offline' },
          },
        },
        {
          urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'ojaly-images', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
        },
        {
          urlPattern: /\/api\/v1\/(storefront|plans|public)\/.*/i,
          handler: 'NetworkFirst',
          options: { cacheName: 'ojaly-public-api', networkTimeoutSeconds: 4, expiration: { maxEntries: 50, maxAgeSeconds: 3600 } },
        },
      ],
    },
    devOptions: { enabled: false },
  },
  typescript: { strict: true, typeCheck: false },
  nitro: { compressPublicAssets: true },
});
