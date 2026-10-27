<script setup lang="ts">
import { ArrowRight, MessageCircle, Sparkles, Star } from 'lucide-vue-next';
import type { StorefrontBusiness, StorefrontTemplate, StorefrontProduct } from '~/types';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
import { whatsappLink } from '~/utils/phone';
const props = defineProps<{ business: StorefrontBusiness; template: StorefrontTemplate; products: StorefrontProduct[]; productCount: number }>();
const wa = computed(() => whatsappLink(props.business.whatsappNumber || props.business.publicPhone, `Hi ${props.business.name}! I'd like to place an order.`));
const featured = computed(() => props.products.slice(0, 3));
const isCentered = computed(() => ['centered', 'soft'].includes(props.template.layout));
const headline = computed(() => props.business.tagline || `Things you'll love, from ${props.business.name}.`);
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-20" :class="isCentered ? 'text-center' : 'lg:grid-cols-[1.05fr_0.95fr] lg:items-center'">
      <div :class="isCentered ? 'mx-auto max-w-3xl' : ''">
        <div class="mb-4 inline-flex flex-wrap items-center gap-2" :class="isCentered ? 'justify-center' : ''">
          <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" :style="{ background: `color-mix(in srgb, ${template.colors.accent} 35%, transparent)`, color: template.colors.ink }"><Sparkles class="h-3 w-3" /> {{ business.category }}</span>
          <span class="inline-flex items-center gap-1 text-[10px] font-semibold" :style="{ color: template.colors.muted }"><Star class="h-3 w-3 fill-current" :style="{ color: template.colors.primary }" /> Shop small. Shop real.</span>
        </div>
        <h1 class="text-[clamp(2.8rem,7vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.06em]" :style="{ color: template.colors.ink }">{{ headline }}</h1>
        <p class="mt-5 max-w-lg text-sm leading-relaxed sm:text-base" :class="isCentered ? 'mx-auto' : ''" :style="{ color: template.colors.muted }">{{ business.description || business.tagline }}</p>
        <div class="mt-7 flex flex-col gap-2.5 sm:flex-row" :class="isCentered ? 'justify-center' : ''">
          <NuxtLink :to="`/s/${business.slug}/products`" class="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition hover:opacity-90" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Shop the collection <ArrowRight class="h-4 w-4" /></NuxtLink>
          <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 px-6 text-sm font-bold transition hover:opacity-70" :style="{ borderColor: template.colors.ink, color: template.colors.ink }"><MessageCircle class="h-4 w-4" /> Order on WhatsApp</a>
        </div>
        <div class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold" :class="isCentered ? 'justify-center' : ''" :style="{ color: template.colors.muted }">
          <span>✦ {{ productCount }} product{{ productCount === 1 ? '' : 's' }}</span>
          <span>✦ Order on WhatsApp</span>
          <span>✦ Pay online or on delivery</span>
        </div>
      </div>

      <div v-if="!isCentered" class="relative">
        <div class="relative aspect-[4/3] overflow-hidden" :style="{ borderRadius: `calc(${template.radius} * 1.3)`, background: template.colors.surface }">
          <video v-if="business.heroVideoUrl" :src="business.heroVideoUrl" :poster="business.bannerUrl ? optimizedImage(business.bannerUrl, 1100) : undefined" class="h-full w-full object-cover" autoplay muted loop playsinline preload="metadata" />
          <img v-else-if="business.bannerUrl" :src="optimizedImage(business.bannerUrl, 1100)" :alt="business.name" class="h-full w-full object-cover">
          <div v-else class="grid h-full grid-cols-2 gap-2 p-2">
            <div v-for="(product, index) in featured" :key="product.id" class="relative overflow-hidden" :style="{ borderRadius: template.radius, background: template.colors.background, gridRow: index === 0 ? 'span 2' : 'span 1' }">
              <img v-if="product.images[0]" :src="optimizedImage(product.images[0], 500)" :alt="product.name" class="h-full w-full object-cover">
              <div v-else class="flex h-full flex-col justify-between p-4" :style="{ background: index === 0 ? template.colors.primary : template.colors.accent, color: index === 0 ? template.colors.onPrimary : template.colors.ink }">
                <span class="text-[9px] font-bold uppercase tracking-widest opacity-70">{{ product.category }}</span>
                <div><p class="font-display text-xl font-bold leading-none">{{ product.name }}</p><p class="mt-1 text-[11px] font-semibold opacity-80">{{ formatNaira(product.priceKobo) }}</p></div>
              </div>
            </div>
            <div v-if="!featured.length" class="col-span-2 flex h-full items-center justify-center" :style="{ background: template.colors.primary }"><span class="font-display text-7xl font-bold opacity-20" :style="{ color: template.colors.onPrimary }">{{ business.name[0] }}</span></div>
          </div>
        </div>
        <div class="absolute -bottom-5 -left-4 rotate-[-2deg] rounded-2xl px-4 py-3 shadow-lg" :style="{ background: template.colors.ink, color: template.colors.background }"><p class="text-[9px] font-bold uppercase tracking-widest opacity-60">Fresh from</p><p class="font-display text-sm font-bold">{{ business.name }}</p></div>
      </div>

      <div v-if="isCentered && business.heroVideoUrl" class="mx-auto mt-4 w-full max-w-3xl overflow-hidden" :style="{ borderRadius: template.radius, background: template.colors.surface }">
        <video :src="business.heroVideoUrl" :poster="business.bannerUrl ? optimizedImage(business.bannerUrl, 1100) : undefined" class="aspect-video w-full object-cover" autoplay muted loop playsinline preload="metadata" />
      </div>
      <div v-else-if="isCentered && featured.length" class="mx-auto mt-2 grid w-full max-w-3xl grid-cols-3 gap-2.5">
        <div v-for="product in featured" :key="product.id" class="aspect-[3/4] overflow-hidden" :style="{ borderRadius: template.radius, background: template.colors.surface }">
          <img v-if="product.images[0]" :src="optimizedImage(product.images[0], 500)" :alt="product.name" class="h-full w-full object-cover">
          <div v-else class="flex h-full items-end p-3" :style="{ background: template.colors.accent, color: template.colors.ink }"><p class="font-display text-sm font-bold">{{ product.name }}</p></div>
        </div>
      </div>
    </div>
  </section>
</template>
