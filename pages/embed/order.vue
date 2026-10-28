<script setup lang="ts">
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
definePageMeta({ layout: false });
useSeoMeta({ title: 'Order', robots: 'noindex' });
const route = useRoute();
const slug = computed(() => String(route.query.b || route.query.business || ''));
const embed = useEmbedCheckout(slug);
const business = embed.business;
const products = embed.products;
const loading = embed.loading;
const errorMessage = embed.error;
const cart = ref<{ productId: string; variantId: string; name: string; variantName: string; priceKobo: number; quantity: number; image?: string }[]>([]);
const form = reactive({ name: '', phone: '', address: '' });
const placing = embed.placing;
const success = ref<{ orderNumber: string; whatsappUrl: string | null } | null>(null);
function closeWidget() { if (window.parent !== window) window.parent.postMessage({ type: 'ojaly:close' }, '*'); else history.back(); }
const count = computed(() => cart.value.reduce((s, i) => s + i.quantity, 0));
const total = computed(() => cart.value.reduce((s, i) => s + i.priceKobo * i.quantity, 0));
function add(product: typeof products.value[number]) {
  const variant = product.variants.find((v) => v.inStock) || product.variants[0];
  if (!variant) return;
  const existing = cart.value.find((c) => c.variantId === variant.id);
  if (existing) existing.quantity++;
  else cart.value.push({ productId: product.id, variantId: variant.id, name: product.name, variantName: variant.name, priceKobo: variant.priceKobo, quantity: 1, image: product.images[0] });
}
async function submit() {
  if (!form.name || !form.phone) { errorMessage.value = 'Your name and phone are needed.'; return; }
  if (!cart.value.length) { errorMessage.value = 'Add at least one item.'; return; }
  placing.value = true; errorMessage.value = '';
  try {
    const result = await embed.place({ customerName: form.name, customerPhone: form.phone, deliveryAddress: form.address, items: cart.value.map((c) => ({ productId: c.productId, variantId: c.variantId, quantity: c.quantity })) });
    success.value = { orderNumber: result.order.orderNumber, whatsappUrl: result.whatsappUrl };
    if (window.parent !== window) window.parent.postMessage({ type: 'ojaly:order-created', orderNumber: result.order.orderNumber }, '*');
  } catch (err) { errorMessage.value = (err as Error).message; }
  finally { placing.value = false; }
}
onMounted(() => embed.load());

</script>

<template>
  <div class="min-h-dvh bg-white p-4" :style="{ '--brand': business?.brandColor || '#FF5A1F' }">
    <div v-if="loading" class="space-y-3"><div class="skeleton h-10 w-40" /><div class="grid grid-cols-2 gap-2"><div v-for="i in 4" :key="i" class="skeleton h-32 rounded-xl" /></div></div>
    <div v-else-if="success" class="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <CheckCircle2 class="h-14 w-14 text-success" />
      <h1 class="mt-3 font-display text-2xl font-bold">Order {{ success.orderNumber }} received</h1>
      <p class="mt-1 text-xs text-muted">The business will contact you shortly.</p>
      <a v-if="success.whatsappUrl" :href="success.whatsappUrl" target="_blank" class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold text-forest-900"><MessageCircle class="h-4 w-4" /> Send on WhatsApp</a>
      <a :href="`/order/${route.query.token || ''}`" class="hidden">status</a>
      <p class="mt-3 text-[10px] text-muted">You can close this window.</p>
    </div>
    <div v-else>
      <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
        <span class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[var(--brand)] text-sm font-bold text-white"><img v-if="business?.logoUrl" :src="business.logoUrl" class="h-full w-full object-cover"><span v-else>{{ business?.name?.[0] }}</span></span>
        <div><p class="text-sm font-bold">{{ business?.name }}</p><p class="text-[10px] text-gray-500">Order directly</p></div>
        <button class="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100" aria-label="Close" @click="closeWidget"><X class="h-4 w-4" /></button>
      </div>
      <p v-if="errorMessage" class="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{{ errorMessage }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button v-for="product in products" :key="product.id" class="flex gap-2 rounded-xl border border-gray-100 p-2 text-left disabled:opacity-40" :disabled="!product.inStock" @click="add(product)">
          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100"><img v-if="product.images[0]" :src="optimizedImage(product.images[0], 80)" class="h-full w-full object-cover"></div>
          <div class="min-w-0"><p class="truncate text-[10px] font-bold">{{ product.name }}</p><p class="text-[9px] text-gray-500">{{ formatNaira(product.priceKobo) }}</p><p class="text-[8px] text-[var(--brand)]">Tap to add</p></div>
        </button>
      </div>
      <div v-if="cart.length" class="mt-4 rounded-xl bg-gray-50 p-3">
        <div v-for="item in cart" :key="item.variantId" class="flex items-center gap-2 py-1"><p class="min-w-0 flex-1 truncate text-[11px] font-semibold">{{ item.quantity }} × {{ item.name }}</p><p class="text-[10px] font-bold">{{ formatNaira(item.priceKobo * item.quantity) }}</p></div>
        <div class="mt-2 flex justify-between border-t border-gray-200 pt-2 text-xs font-bold"><span>Total</span><span>{{ formatNaira(total) }}</span></div>
      </div>
      <div class="mt-3 space-y-2">
        <input v-model="form.name" placeholder="Your name" class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs">
        <input v-model="form.phone" placeholder="Phone / WhatsApp" class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs" inputmode="tel">
        <input v-model="form.address" placeholder="Delivery address" class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs">
        <button class="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] py-3 text-xs font-bold text-white disabled:opacity-50" :disabled="placing || !cart.length" @click="submit"><ShoppingBag class="h-4 w-4" /> {{ placing ? 'Placing order…' : 'Place order' }}</button>
        <p class="text-center text-[9px] text-gray-400">Order goes straight to {{ business?.name }} · Powered by Ojaly</p>
      </div>
    </div>
  </div>
</template>
