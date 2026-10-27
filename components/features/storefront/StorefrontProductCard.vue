<script setup lang="ts">
import { MessageCircle, Plus, ShoppingBag } from 'lucide-vue-next';
import type { StorefrontProduct, StorefrontTemplate, StorefrontBusiness } from '~/types';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
import { whatsappLink } from '~/utils/phone';
const props = defineProps<{ product: StorefrontProduct; template: StorefrontTemplate; business: StorefrontBusiness }>();
const cart = useCartStore();
const router = useRouter();
const toast = useToast();
const firstVariant = computed(() => props.product.variants.find((v) => v.id) || props.product.variants[0]);
const productUrl = computed(() => `/s/${props.business.slug}/products/${props.product.id}`);
function add() {
  if (!props.product.inStock) { toast.warning('This one is out of stock right now.'); return; }
  if (props.product.variants.length > 1) { void router.push(productUrl.value); return; }
  const variant = firstVariant.value;
  if (!variant?.id) return;
  cart.init(props.business.slug, props.business.name);
  cart.add({ productId: props.product.id, variantId: variant.id, name: props.product.name, variantName: variant.name, priceKobo: variant.priceKobo, imageUrl: props.product.images[0], slug: props.business.slug });
  toast.success(`${props.product.name} added to cart.`);
}
const whatsapp = computed(() => whatsappLink(props.business.whatsappNumber || props.business.publicPhone, `Hi ${props.business.name}! I'm interested in ${props.product.name} (${formatNaira(props.product.priceKobo)}).`));
</script>

<template>
  <div class="group overflow-hidden border transition hover:-translate-y-0.5" :style="{ borderRadius: template.radius, background: template.colors.surface, borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }">
    <NuxtLink :to="productUrl" class="relative block aspect-[4/5] overflow-hidden" :style="{ background: template.colors.background }">
      <img v-if="product.images[0]" :src="optimizedImage(product.images[0], 700)" :alt="product.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy">
      <div v-else class="flex h-full flex-col items-center justify-center gap-2" :style="{ background: `linear-gradient(135deg, color-mix(in srgb, ${template.colors.primary} 18%, ${template.colors.background}), ${template.colors.background})` }">
        <span class="font-display text-6xl font-bold opacity-20" :style="{ color: template.colors.ink }">{{ product.name[0] }}</span>
        <span class="text-[10px] font-bold uppercase tracking-widest opacity-40" :style="{ color: template.colors.ink }">{{ product.category }}</span>
      </div>
      <div class="absolute left-2.5 top-2.5 flex gap-1.5">
        <span v-if="!product.inStock" class="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide" :style="{ background: template.colors.ink, color: template.colors.background }">Sold out</span>
        <span v-else-if="product.variants.some((v) => v.lowStock)" class="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide" :style="{ background: template.colors.accent, color: template.colors.ink }">Few left</span>
      </div>
    </NuxtLink>
    <div class="p-3.5">
      <NuxtLink :to="productUrl"><h3 class="truncate text-[13px] font-bold" :style="{ color: template.colors.ink }">{{ product.name }}</h3></NuxtLink>
      <p class="mt-0.5 text-[10px]" :style="{ color: template.colors.muted }">{{ product.category }}<span v-if="product.variants.length > 1"> · {{ product.variants.length }} options</span></p>
      <div class="mt-2.5 flex items-center justify-between gap-2">
        <p class="font-display text-base font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(product.priceKobo) }}</p>
        <div class="flex gap-1">
          <a v-if="business.whatsappNumber || business.publicPhone" :href="whatsapp" target="_blank" rel="noopener" class="flex h-8 w-8 items-center justify-center rounded-full border transition hover:opacity-70" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }" :aria-label="`Ask about ${product.name} on WhatsApp`"><MessageCircle class="h-3.5 w-3.5" /></a>
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-80 disabled:opacity-30" :style="{ background: template.colors.primary, color: template.colors.onPrimary }" :disabled="!product.inStock" :aria-label="`Add ${product.name} to cart`" @click="add"><Plus class="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
