<script setup lang="ts">
import { ArrowLeft, Check, MessageCircle, Minus, Plus, ShoppingBag, Truck } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: false });
const route = useRoute();
const config = useRuntimeConfig();
const router = useRouter();
const toast = useToast();
const cart = useCartStore();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { data, error } = await useStorefrontProduct(slug, id);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true });
const product = computed(() => data.value!.product);
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
const selectedImage = ref(0);
const selectedVariant = ref(product.value.variants.find((v) => v.inStock) || product.value.variants[0]);
const quantity = ref(1);
const ogImage = computed(() => product.value.images[0] || business.value.bannerUrl || business.value.logoUrl || `${config.public.appUrl}/pwa-512.png`);
useSeoMeta({
  title: computed(() => `${product.value.name} — ${business.value.name}`),
  description: computed(() => product.value.description?.slice(0, 160) || `Buy ${product.value.name} from ${business.value.name}.`),
  ogTitle: computed(() => product.value.name),
  ogDescription: computed(() => product.value.description?.slice(0, 200) || business.value.tagline),
  ogImage: computed(() => ogImage.value),
  ogType: 'website',
  twitterCard: 'summary_large_image',
});
useHead({
  titleTemplate: '%s',
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: product.value.name,
      description: product.value.description, image: product.value.images,
      offers: { '@type': 'Offer', priceCurrency: 'NGN', price: product.value.priceKobo / 100, availability: product.value.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', seller: { '@type': 'Organization', name: business.value.name } },
    })),
  }],
});
function addToCart() {
  if (!selectedVariant.value?.inStock) { toast.warning('That option is out of stock.'); return; }
  cart.init(business.value.slug, business.value.name);
  cart.add({
    productId: product.value.id, variantId: selectedVariant.value.id, name: product.value.name,
    variantName: selectedVariant.value.name, priceKobo: selectedVariant.value.priceKobo,
    imageUrl: product.value.images[0], slug: business.value.slug,
  }, quantity.value);
  toast.success('Added to cart.');
}
function buyNow() {
  addToCart();
  void router.push(`/s/${business.value.slug}/cart`);
}
const wa = computed(() => whatsappLink(business.value.whatsappNumber || business.value.publicPhone, `Hi ${business.value.name}! I'd like to order ${product.value.name} (${formatNaira(selectedVariant.value?.priceKobo || product.value.priceKobo)}).`));
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <NuxtLink :to="`/s/${business.slug}/products`" class="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-60" :style="{ color: template.colors.muted }"><ArrowLeft class="h-4 w-4" /> Back to shop</NuxtLink>
      <div class="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div class="aspect-square overflow-hidden" :style="{ borderRadius: `calc(${template.radius} * 1.2)`, background: template.colors.surface }">
            <img v-if="product.images[selectedImage]" :src="optimizedImage(product.images[selectedImage], 1200)" :alt="product.name" class="h-full w-full object-cover">
            <div v-else class="flex h-full items-center justify-center" :style="{ background: `linear-gradient(135deg, color-mix(in srgb, ${template.colors.primary} 20%, ${template.colors.background}), ${template.colors.background})` }"><span class="font-display text-9xl font-bold opacity-20" :style="{ color: template.colors.ink }">{{ product.name[0] }}</span></div>
          </div>
          <div v-if="product.images.length > 1" class="mt-3 flex gap-2 overflow-x-auto">
            <button v-for="(image, index) in product.images" :key="image" type="button" class="h-16 w-16 shrink-0 overflow-hidden border-2" :style="{ borderColor: selectedImage === index ? template.colors.primary : 'transparent', borderRadius: template.radius }" @click="selectedImage = index"><img :src="optimizedImage(image, 160)" alt="" class="h-full w-full object-cover"></button>
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">{{ product.category }}</p>
          <h1 class="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl" :style="{ color: template.colors.ink }">{{ product.name }}</h1>
          <p class="mt-3 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(selectedVariant?.priceKobo || product.priceKobo) }}</p>
          <p class="mt-4 whitespace-pre-line text-sm leading-relaxed" :style="{ color: template.colors.muted }">{{ product.description || 'A quality pick from our collection.' }}</p>

          <div v-if="product.variants.length > 1" class="mt-6">
            <p class="text-xs font-bold" :style="{ color: template.colors.ink }">Choose an option</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button v-for="variant in product.variants" :key="variant.id" type="button" class="rounded-full border px-4 py-2 text-xs font-semibold disabled:line-through disabled:opacity-40" :style="selectedVariant?.id === variant.id ? { background: template.colors.ink, color: template.colors.background, borderColor: template.colors.ink } : { color: template.colors.ink, borderColor: `color-mix(in srgb, ${template.colors.ink} 25%, transparent)` }" :disabled="!variant.inStock" @click="selectedVariant = variant">{{ variant.name }}</button>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <div class="flex items-center rounded-full border" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }"><button class="flex h-11 w-11 items-center justify-center" aria-label="Reduce" @click="quantity = Math.max(1, quantity - 1)"><Minus class="h-4 w-4" /></button><span class="w-8 text-center text-sm font-bold">{{ quantity }}</span><button class="flex h-11 w-11 items-center justify-center" aria-label="Increase" @click="quantity++"><Plus class="h-4 w-4" /></button></div>
            <button type="button" class="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold disabled:opacity-40" :style="{ background: template.colors.primary, color: template.colors.onPrimary }" :disabled="!product.inStock" @click="addToCart"><ShoppingBag class="h-4 w-4" /> Add to cart</button>
          </div>
          <div class="mt-2 flex gap-2">
            <button type="button" class="flex min-h-[48px] flex-1 items-center justify-center rounded-full border-2 text-sm font-bold disabled:opacity-40" :style="{ borderColor: template.colors.ink, color: template.colors.ink }" :disabled="!product.inStock" @click="buyNow">Buy now</button>
            <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="flex min-h-[48px] w-12 items-center justify-center rounded-full" :style="{ background: '#25D366', color: '#06231A' }" aria-label="Order on WhatsApp"><MessageCircle class="h-5 w-5" /></a>
          </div>
          <div class="mt-6 space-y-2 border-t pt-4 text-xs" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)`, color: template.colors.muted }">
            <p class="flex items-center gap-2"><Check class="h-3.5 w-3.5" :style="{ color: template.colors.primary }" /> Pay online or when you receive it</p>
            <p class="flex items-center gap-2"><Truck class="h-3.5 w-3.5" :style="{ color: template.colors.primary }" /> Delivery arranged directly with the seller</p>
            <p class="flex items-center gap-2"><MessageCircle class="h-3.5 w-3.5" :style="{ color: template.colors.primary }" /> Questions? Chat with us on WhatsApp</p>
          </div>
        </div>
      </div>

      <section v-if="data.related.length" class="mt-16 border-t pt-10" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }">
        <h2 class="font-display text-2xl font-bold" :style="{ color: template.colors.ink }">You might also like</h2>
        <div class="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"><StorefrontProductCard v-for="item in data.related" :key="item.id" :product="item" :template="template" :business="business" /></div>
      </section>
    </div>
  </StorefrontShell>
</template>
