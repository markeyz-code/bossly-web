<script setup lang="ts">
import { ArrowRight, Instagram, Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-vue-next';
import type { StorefrontBusiness, StorefrontTemplate } from '~/types';
import { templateVars } from '~/utils/templates';
import { whatsappLink } from '~/utils/phone';
import { optimizedImage } from '~/utils/cloudinary';
const props = defineProps<{ business: StorefrontBusiness; template: StorefrontTemplate }>();
const cart = useCartStore();
const open = ref(false);
const route = useRoute();
const links = computed(() => [
  { to: `/s/${props.business.slug}`, label: 'Home', exact: true },
  { to: `/s/${props.business.slug}/products`, label: 'Shop' },
  { to: `/s/${props.business.slug}/about`, label: 'About' },
  { to: `/s/${props.business.slug}/contact`, label: 'Contact' },
]);
const active = (to: string, exact = false) => exact ? route.path === to : route.path.startsWith(to);
const wa = computed(() => whatsappLink(props.business.whatsappNumber || props.business.publicPhone, `Hi ${props.business.name}! I'd like to order.`));
const mounted = ref(false);
onMounted(() => { cart.hydrate(); mounted.value = true; });
watch(() => props.business.slug, (slug) => cart.init(slug, props.business.name), { immediate: true });
</script>

<template>
  <div class="storefront min-h-dvh" :style="templateVars(template)" :data-layout="template.layout" :data-card="template.cardStyle">
    <div class="border-b text-center text-[11px] font-semibold tracking-wide" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">
      <p class="px-3 py-2">{{ business.tagline }}</p>
    </div>
    <header class="sticky top-0 z-40 border-b backdrop-blur-xl" :style="{ background: `color-mix(in srgb, ${template.colors.background} 88%, transparent)`, borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)` }">
      <div class="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NuxtLink :to="`/s/${business.slug}`" class="flex min-w-0 items-center gap-2.5">
          <span v-if="business.logoUrl" class="h-9 w-9 shrink-0 overflow-hidden rounded-xl"><img :src="optimizedImage(business.logoUrl, 100)" :alt="business.name" class="h-full w-full object-cover"></span>
          <span v-else class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">{{ business.name[0] }}</span>
          <span class="truncate font-display text-lg font-bold" :style="{ color: template.colors.ink }">{{ business.name }}</span>
        </NuxtLink>
        <nav class="hidden items-center gap-6 md:flex">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="text-xs font-semibold transition hover:opacity-60" :style="{ color: active(link.to, link.exact) ? template.colors.primary : template.colors.ink }">{{ link.label }}</NuxtLink>
        </nav>
        <div class="flex items-center gap-1.5">
          <NuxtLink :to="`/s/${business.slug}/products`" class="flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-70" :style="{ color: template.colors.ink }" aria-label="Search products"><Search class="h-[18px] w-[18px]" /></NuxtLink>
          <NuxtLink :to="`/s/${business.slug}/cart`" class="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-70" :style="{ color: template.colors.ink }" aria-label="Cart">
            <ShoppingBag class="h-[18px] w-[18px]" />
            <span v-if="mounted && cart.count" class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">{{ cart.count }}</span>
          </NuxtLink>
          <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full md:hidden" :style="{ color: template.colors.ink }" aria-label="Menu" @click="open = !open"><X v-if="open" class="h-5 w-5" /><Menu v-else class="h-5 w-5" /></button>
          <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold md:inline-flex" :style="{ background: template.colors.primary, color: template.colors.onPrimary }"><MessageCircle class="h-3.5 w-3.5" /> WhatsApp</a>
        </div>
      </div>
      <div v-if="open" class="border-t px-4 py-3 md:hidden" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)` }">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="block rounded-lg px-3 py-3 text-sm font-semibold" :style="{ color: template.colors.ink }" @click="open = false">{{ link.label }}</NuxtLink>
        <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }"><MessageCircle class="h-4 w-4" /> Chat to order</a>
      </div>
    </header>

    <main><slot /></main>

    <footer class="mt-16 border-t" :style="{ background: template.colors.ink, borderColor: template.colors.ink, color: template.colors.background }">
      <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div class="lg:col-span-2">
            <p class="font-display text-3xl font-bold tracking-tight">{{ business.name }}</p>
            <p class="mt-2 max-w-sm text-sm leading-relaxed opacity-70">{{ business.tagline }}</p>
            <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }"><MessageCircle class="h-4 w-4" /> Chat with us</a>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">Shop</p>
            <NuxtLink :to="`/s/${business.slug}/products`" class="mt-3 block text-sm opacity-80 hover:opacity-100">All products</NuxtLink>
            <NuxtLink :to="`/s/${business.slug}/about`" class="mt-2 block text-sm opacity-80 hover:opacity-100">Our story</NuxtLink>
            <NuxtLink :to="`/s/${business.slug}/contact`" class="mt-2 block text-sm opacity-80 hover:opacity-100">Contact</NuxtLink>
            <NuxtLink :to="`/s/${business.slug}/cart`" class="mt-2 block text-sm opacity-80 hover:opacity-100">Your cart</NuxtLink>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">Find us</p>
            <p v-if="business.address" class="mt-3 text-sm opacity-80">{{ business.address }}</p>
            <a v-if="business.publicPhone" :href="`tel:${business.publicPhone}`" class="mt-2 block text-sm opacity-80 hover:opacity-100">{{ business.publicPhone }}</a>
            <a v-if="business.email" :href="`mailto:${business.email}`" class="mt-2 block text-sm opacity-80 hover:opacity-100">{{ business.email }}</a>
            <div class="mt-3 flex gap-2">
              <a v-for="(url, network) in business.socialLinks" :key="network" :href="url" target="_blank" rel="noopener" class="flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-[10px] font-bold uppercase opacity-70 hover:opacity-100">{{ String(network)[0] }}</a>
            </div>
          </div>
        </div>
        <div class="mt-10 flex flex-col gap-2 border-t border-current/10 pt-5 text-[10px] opacity-50 sm:flex-row sm:justify-between">
          <p>© {{ new Date().getFullYear() }} {{ business.name }}. All rights reserved.</p>
          <NuxtLink to="/" target="_blank" class="hover:opacity-100">Store powered by Ojaly · get yours free</NuxtLink>
        </div>
      </div>
    </footer>

    <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-forest-900 shadow-lg transition hover:scale-105 md:hidden" aria-label="Chat on WhatsApp"><MessageCircle class="h-7 w-7" /></a>
  </div>
</template>

<style scoped>
.storefront { background: var(--sf-bg); color: var(--sf-ink); font-family: 'DM Sans Variable', sans-serif; }
.storefront :deep(h1), .storefront :deep(h2), .storefront :deep(h3), .storefront :deep(.font-display) { font-family: 'Space Grotesk Variable', sans-serif; letter-spacing: -0.035em; }
.storefront[data-layout='editorial'] :deep(h1), .storefront[data-layout='editorial'] :deep(h2), .storefront[data-layout='soft'] :deep(h1), .storefront[data-layout='soft'] :deep(h2), .storefront[data-layout='sunset'] :deep(h1), .storefront[data-layout='sunset'] :deep(h2) { font-family: 'Fraunces Variable', Georgia, serif; letter-spacing: -0.02em; }
.storefront[data-layout='campus'] :deep(h1), .storefront[data-layout='campus'] :deep(h2), .storefront[data-layout='campus'] :deep(h3) { font-family: 'Bricolage Grotesque Variable', 'Bricolage Grotesque', sans-serif; letter-spacing: -0.045em; }
</style>
