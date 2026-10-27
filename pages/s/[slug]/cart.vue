<script setup lang="ts">
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
definePageMeta({ layout: false });
const route = useRoute();
const cart = useCartStore();
const slug = computed(() => String(route.params.slug));
const { data, error } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const template = computed(() => data.value!.template);
const business = computed(() => data.value!.business);
useSeoMeta({ title: computed(() => `Cart — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
onMounted(() => { cart.hydrate(); cart.init(business.value.slug, business.value.name); });
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <ClientOnly>
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <NuxtLink :to="`/s/${business.slug}/products`" class="inline-flex items-center gap-1.5 text-xs font-semibold" :style="{ color: template.colors.muted }"><ArrowLeft class="h-4 w-4" /> Continue shopping</NuxtLink>
      <h1 class="mt-3 font-display text-4xl font-bold tracking-tight" :style="{ color: template.colors.ink }">Your cart</h1>
      <div v-if="!cart.items.length" class="mt-8 rounded-3xl border border-dashed p-12 text-center" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }">
        <ShoppingBag class="mx-auto h-10 w-10 opacity-25" :style="{ color: template.colors.ink }" />
        <p class="mt-4 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">Nothing in here yet</p>
        <p class="mt-1 text-sm" :style="{ color: template.colors.muted }">The good stuff is one tap away.</p>
        <NuxtLink :to="`/s/${business.slug}/products`" class="mt-5 inline-flex rounded-full px-6 py-3 text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Shop the collection</NuxtLink>
      </div>
      <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div class="divide-y rounded-2xl border" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface }">
          <div v-for="item in cart.items" :key="item.variantId" class="flex gap-3 p-4">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl" :style="{ background: template.colors.background }"><img v-if="item.imageUrl" :src="optimizedImage(item.imageUrl, 200)" :alt="item.name" class="h-full w-full object-cover"><div v-else class="flex h-full items-center justify-center font-display text-2xl font-bold opacity-20">{{ item.name[0] }}</div></div>
            <div class="min-w-0 flex-1"><p class="text-sm font-bold" :style="{ color: template.colors.ink }">{{ item.name }}</p><p class="text-[11px]" :style="{ color: template.colors.muted }">{{ item.variantName }}</p><p class="mt-1 text-sm font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(item.priceKobo) }}</p></div>
            <div class="flex flex-col items-end justify-between">
              <button class="p-1 opacity-40 hover:opacity-80" :style="{ color: template.colors.ink }" aria-label="Remove" @click="cart.remove(item.variantId)"><Trash2 class="h-4 w-4" /></button>
              <div class="flex items-center rounded-full border" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)` }"><button class="flex h-8 w-8 items-center justify-center" @click="cart.setQuantity(item.variantId, item.quantity - 1)"><Minus class="h-3 w-3" /></button><span class="w-6 text-center text-xs font-bold">{{ item.quantity }}</span><button class="flex h-8 w-8 items-center justify-center" @click="cart.setQuantity(item.variantId, item.quantity + 1)"><Plus class="h-3 w-3" /></button></div>
            </div>
          </div>
        </div>
        <div class="h-fit rounded-2xl border p-5" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface, borderRadius: template.radius }">
          <h2 class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">Order summary</h2>
          <div class="mt-4 flex justify-between text-sm"><span :style="{ color: template.colors.muted }">Subtotal ({{ cart.count }} items)</span><span class="font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(cart.subtotalKobo) }}</span></div>
          <p class="mt-1 text-[11px]" :style="{ color: template.colors.muted }">Delivery is arranged with the seller after checkout.</p>
          <div class="mt-4 flex justify-between border-t pt-3" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }"><span class="font-bold" :style="{ color: template.colors.ink }">Total</span><span class="font-display text-2xl font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(cart.subtotalKobo) }}</span></div>
          <NuxtLink :to="`/s/${business.slug}/checkout`" class="mt-5 flex min-h-[52px] items-center justify-center rounded-full text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Checkout</NuxtLink>
          <p class="mt-3 text-center text-[10px]" :style="{ color: template.colors.muted }">Pay online or finish on WhatsApp.</p>
        </div>
      </div>
    </div>
    </ClientOnly>
  </StorefrontShell>
</template>
