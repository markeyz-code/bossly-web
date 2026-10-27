<script setup lang="ts">
import { ArrowRight, Check, Heart, MessageCircle, PackageCheck, Sparkles, Truck } from 'lucide-vue-next';
import type { StorefrontHome } from '~/types';
import { whatsappLink } from '~/utils/phone';
import { optimizedImage } from '~/utils/cloudinary';
const props = defineProps<{ home: StorefrontHome }>();
const { business, template, products, categories, productCount } = toRefs(props.home);
const wa = computed(() => whatsappLink(business.value.whatsappNumber || business.value.publicPhone, `Hi ${business.value.name}! I'd like to order.`));
const reveal = ref(false);
onMounted(() => { reveal.value = true; });
</script>

<template>
  <div>
    <template v-for="section in business.sections" :key="section">
      <StorefrontHero v-if="section === 'hero'" :business="business" :template="template" :products="products" :product-count="productCount" />
      <section v-else-if="section === 'featured'" class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div class="flex items-end justify-between gap-4">
          <div><p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Handpicked</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: template.colors.ink }">Fresh off the shelf</h2></div>
          <NuxtLink :to="`/s/${business.slug}/products`" class="hidden items-center gap-1 text-xs font-bold sm:inline-flex" :style="{ color: template.colors.ink }">See everything <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
        </div>
        <div v-if="products.length" class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StorefrontProductCard v-for="product in products.slice(0, 4)" :key="product.id" :product="product" :template="template" :business="business" />
        </div>
        <div v-else class="mt-6 rounded-2xl border border-dashed p-10 text-center" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }"><p class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">The first drop is loading</p><p class="mt-1 text-xs" :style="{ color: template.colors.muted }">Message us on WhatsApp and we’ll tell you what’s available.</p></div>
        <NuxtLink :to="`/s/${business.slug}/products`" class="mt-6 flex min-h-[48px] items-center justify-center gap-1.5 rounded-full border text-xs font-bold sm:hidden" :style="{ borderColor: template.colors.ink, color: template.colors.ink }">See all {{ productCount }} products <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
      </section>

      <section v-else-if="section === 'story'" class="border-y" :style="{ background: `color-mix(in srgb, ${template.colors.ink} 4%, ${template.colors.background})`, borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }">
        <div class="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div class="relative">
            <div v-if="business.storyImageUrl || business.logoUrl" class="mx-auto flex aspect-square w-52 items-center justify-center overflow-hidden rounded-[2rem] sm:w-64" :style="{ background: template.colors.surface }"><img :src="business.storyImageUrl || business.logoUrl || ''" :alt="business.name" class="h-full w-full object-cover"></div>
            <div v-else class="mx-auto flex aspect-square w-52 flex-col items-center justify-center rounded-[2rem] p-6 text-center sm:w-64" :style="{ background: template.colors.primary, color: template.colors.onPrimary }"><Sparkles class="h-8 w-8 opacity-60" /><p class="mt-3 font-display text-3xl font-bold leading-none">{{ business.name }}</p><p class="mt-2 text-[10px] font-semibold uppercase tracking-widest opacity-70">{{ business.category }}</p></div>
            <div class="absolute -bottom-3 right-4 rotate-2 rounded-xl px-3 py-2 text-[10px] font-bold shadow-lg" :style="{ background: template.colors.accent, color: template.colors.ink }">Student-owned. Lagos-made.</div>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">The story</p>
            <h2 class="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: template.colors.ink }">Built with care, not a warehouse.</h2>
            <p class="mt-4 whitespace-pre-line text-sm leading-relaxed" :style="{ color: template.colors.muted }">{{ business.about || business.description }}</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span v-for="point in ['Small-batch drops', 'Real customer service', 'Packed with care']" :key="point" class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }"><Check class="h-3 w-3" :style="{ color: template.colors.primary }" /> {{ point }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'lookbook' && business.lookbook?.length" class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div class="flex items-end justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">The lookbook</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: template.colors.ink }">{{ business.lookbookTitle || 'In the wild' }}</h2></div><span class="hidden text-[10px] font-semibold sm:block" :style="{ color: template.colors.muted }">Shot by us. Worn by you.</span></div>
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <figure v-for="(item, index) in business.lookbook" :key="item.url" class="group relative overflow-hidden" :class="index === 0 ? 'col-span-2 row-span-2' : ''" :style="{ borderRadius: template.radius, background: template.colors.surface }">
            <img :src="optimizedImage(item.url, index === 0 ? 1000 : 600)" :alt="item.caption || `${business.name} lookbook`" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" :class="index === 0 ? 'aspect-square' : 'aspect-[4/5]'" loading="lazy">
            <figcaption v-if="item.caption" class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs font-semibold text-white">{{ item.caption }}</figcaption>
          </figure>
        </div>
      </section>

      <section v-else-if="section === 'categories' && categories.length" class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div class="flex items-end justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Browse</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight" :style="{ color: template.colors.ink }">Shop by category</h2></div></div>
        <div class="mt-5 flex flex-wrap gap-2">
          <NuxtLink v-for="category in categories" :key="category" :to="`/s/${business.slug}/products?category=${encodeURIComponent(category)}`" class="rounded-full border px-4 py-2.5 text-xs font-bold transition hover:opacity-60" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, color: template.colors.ink }">{{ category }}</NuxtLink>
          <NuxtLink :to="`/s/${business.slug}/products`" class="rounded-full px-4 py-2.5 text-xs font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">All products</NuxtLink>
        </div>
      </section>

      <section v-else-if="section === 'products'" class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div class="flex items-end justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">The full drop</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: template.colors.ink }">Everything in store</h2></div><NuxtLink :to="`/s/${business.slug}/products`" class="hidden items-center gap-1 text-xs font-bold sm:inline-flex" :style="{ color: template.colors.ink }">Shop all <ArrowRight class="h-3.5 w-3.5" /></NuxtLink></div>
        <div v-if="products.length" class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StorefrontProductCard v-for="product in products" :key="product.id" :product="product" :template="template" :business="business" />
        </div>
        <div v-else class="mt-6 rounded-2xl border border-dashed p-10 text-center" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }"><p class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">Restocking soon</p><p class="mt-1 text-xs" :style="{ color: template.colors.muted }">Follow us or message us on WhatsApp for the next drop.</p></div>
      </section>

      <section v-else-if="section === 'testimonials'" class="border-y" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)`, background: template.colors.surface }">
        <div class="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <div v-for="(promise, index) in [{ icon: PackageCheck, title: 'Packed with care', body: 'Every order is checked and packed by hand before it leaves.' }, { icon: MessageCircle, title: 'Real human service', body: 'Questions? Message us directly on WhatsApp. We reply.' }, { icon: Heart, title: 'Support a student', body: 'Every order supports a young Nigerian business, not a giant chain.' }]" :key="promise.title" class="rounded-2xl p-5" :style="{ background: index === 0 ? template.colors.primary : template.colors.background, color: index === 0 ? template.colors.onPrimary : template.colors.ink, borderRadius: template.radius }">
            <component :is="promise.icon" class="h-5 w-5 opacity-70" /><p class="mt-3 font-display text-lg font-bold">{{ promise.title }}</p><p class="mt-1 text-xs leading-relaxed opacity-70">{{ promise.body }}</p>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'contact'" class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div class="overflow-hidden rounded-[2rem] p-7 sm:p-10" :style="{ background: template.colors.ink, color: template.colors.background }">
          <div class="grid gap-6 sm:grid-cols-[1.3fr_1fr] sm:items-center">
            <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">Talk to a human</p><h2 class="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Questions? We answer.</h2><p class="mt-2 max-w-md text-sm leading-relaxed opacity-70">Sizing, delivery, custom requests — send a message. No bots pretending to be people.</p></div>
            <div class="flex flex-col gap-2"><a v-if="wa" :href="wa" target="_blank" rel="noopener" class="flex min-h-[50px] items-center justify-center gap-2 rounded-full text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }"><MessageCircle class="h-4 w-4" /> WhatsApp us</a><NuxtLink :to="`/s/${business.slug}/contact`" class="flex min-h-[50px] items-center justify-center gap-2 rounded-full border-2 text-sm font-bold" :style="{ borderColor: `color-mix(in srgb, ${template.colors.background} 35%, transparent)`, color: template.colors.background }">Send a message</NuxtLink></div>
          </div>
          <div class="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 text-[11px] opacity-60" :style="{ borderColor: `color-mix(in srgb, ${template.colors.background} 15%, transparent)` }"><span v-if="business.address">{{ business.address }}</span><span v-if="business.publicPhone">{{ business.publicPhone }}</span><span v-if="business.email">{{ business.email }}</span></div>
        </div>
      </section>
    </template>
  </div>
</template>
