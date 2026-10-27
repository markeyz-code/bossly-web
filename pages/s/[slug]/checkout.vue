<script setup lang="ts">
import { ArrowLeft, CheckCircle2, LockKeyhole, MessageCircle } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: false });
const route = useRoute();
const router = useRouter();
const toast = useToast();
const cart = useCartStore();
const slug = computed(() => String(route.params.slug));
const { data, error } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
useSeoMeta({ title: computed(() => `Checkout — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
const form = reactive({ name: '', phone: '', email: '', address: '', details: '', notes: '', payOnline: false });
const errors = reactive<Record<string, string>>({});
const { submitting, error: submitError, result, place } = useStorefrontCheckout(business.value.slug);
const waUrl = ref('');
const orderNumber = ref('');
const orderToken = ref('');
onMounted(() => { cart.hydrate(); cart.init(business.value.slug, business.value.name); });
async function submit() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!/^(?:234|0)?[789][01]\d{8}$/.test(form.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid Nigerian phone number.';
  if (form.payOnline && !form.email) errors.email = 'Add your email to pay online.';
  if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
  try {
    const response = await place({
      customerName: form.name, customerPhone: form.phone, customerEmail: form.email || undefined,
      deliveryAddress: form.address, deliveryDetails: form.details, notes: form.notes,
      items: cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      payOnline: form.payOnline,
    });
    orderNumber.value = response.order.orderNumber;
    orderToken.value = response.orderToken;
    waUrl.value = response.whatsappUrl || '';
    cart.clear();
    if (response.payment?.authorizationUrl) {
      toast.success('Order created. Taking you to Paystack…');
      window.location.href = response.payment.authorizationUrl;
    }
  } catch (err) { toast.error((err as Error).message); }
}
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <ClientOnly>
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <template v-if="result">
        <div class="mx-auto max-w-xl text-center">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 15%, transparent)` }"><CheckCircle2 class="h-10 w-10" :style="{ color: template.colors.primary }" /></div>
          <p class="mt-4 text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Order {{ orderNumber }}</p>
          <h1 class="mt-1 font-display text-4xl font-bold tracking-tight" :style="{ color: template.colors.ink }">Order received.</h1>
          <p class="mt-3 text-sm leading-relaxed" :style="{ color: template.colors.muted }">Your order is now with {{ business.name }}. Send the WhatsApp message so they can confirm payment and delivery.</p>
          <div class="mt-6 flex flex-col gap-2">
            <a v-if="waUrl" :href="waUrl" target="_blank" rel="noopener" class="flex min-h-[54px] items-center justify-center gap-2 rounded-full text-sm font-bold" :style="{ background: '#25D366', color: '#06231A' }"><MessageCircle class="h-5 w-5" /> Send order on WhatsApp</a>
            <NuxtLink :to="`/order/${orderToken}`" class="flex min-h-[50px] items-center justify-center rounded-full border-2 text-sm font-bold" :style="{ borderColor: template.colors.ink, color: template.colors.ink }">Track my order</NuxtLink>
            <NuxtLink :to="`/s/${business.slug}/products`" class="py-3 text-xs font-semibold" :style="{ color: template.colors.muted }">Continue shopping</NuxtLink>
          </div>
        </div>
      </template>
      <template v-else>
        <NuxtLink :to="`/s/${business.slug}/cart`" class="inline-flex items-center gap-1.5 text-xs font-semibold" :style="{ color: template.colors.muted }"><ArrowLeft class="h-4 w-4" /> Back to cart</NuxtLink>
        <h1 class="mt-3 font-display text-4xl font-bold tracking-tight" :style="{ color: template.colors.ink }">Checkout</h1>
        <div v-if="!cart.items.length" class="mt-6 rounded-3xl border border-dashed p-10 text-center" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }">
          <p class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">Your cart is empty</p>
          <NuxtLink :to="`/s/${business.slug}/products`" class="mt-4 inline-flex rounded-full px-5 py-3 text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Go shopping</NuxtLink>
        </div>
        <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div class="rounded-2xl border p-5 sm:p-6" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface, borderRadius: template.radius }">
            <h2 class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">Where should it go?</h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="block"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Full name *</span><input v-model="form.name" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" autocomplete="name"></label>
              <label class="block"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Phone (WhatsApp) *</span><input v-model="form.phone" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" inputmode="tel" autocomplete="tel"></label>
              <label class="block sm:col-span-2"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Email {{ form.payOnline ? '*' : '(optional)' }}</span><input v-model="form.email" type="email" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" autocomplete="email"></label>
              <label class="block sm:col-span-2"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Delivery address</span><input v-model="form.address" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" placeholder="Street, area, campus" autocomplete="street-address"></label>
              <label class="block sm:col-span-2"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Delivery notes</span><input v-model="form.details" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" placeholder="Landmark, best time to call"></label>
              <label class="block sm:col-span-2"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Anything else?</span><textarea v-model="form.notes" rows="2" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" /></label>
            </div>
            <label class="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border p-3" :style="{ borderColor: form.payOnline ? template.colors.primary : `color-mix(in srgb, ${template.colors.ink} 15%, transparent)` }">
              <input v-model="form.payOnline" type="checkbox" class="mt-0.5 accent-current" :style="{ accentColor: template.colors.primary }">
              <span><span class="flex items-center gap-1.5 text-xs font-bold" :style="{ color: template.colors.ink }"><LockKeyhole class="h-3.5 w-3.5" /> Pay online with Paystack</span><span class="mt-0.5 block text-[10px]" :style="{ color: template.colors.muted }">Secure card, transfer or USSD. Or leave unchecked and arrange payment on WhatsApp.</span></span>
            </label>
            <p v-if="submitError" class="mt-3 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger">{{ submitError }}</p>
          </div>
          <div class="h-fit rounded-2xl border p-5" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface, borderRadius: template.radius }">
            <h2 class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">Your order</h2>
            <div class="mt-3 space-y-3">
              <div v-for="item in cart.items" :key="item.variantId" class="flex items-center gap-2.5">
                <div class="h-11 w-11 shrink-0 overflow-hidden rounded-lg" :style="{ background: template.colors.background }"><img v-if="item.imageUrl" :src="optimizedImage(item.imageUrl, 100)" class="h-full w-full object-cover"></div>
                <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold" :style="{ color: template.colors.ink }">{{ item.quantity }} × {{ item.name }}</p><p class="text-[10px]" :style="{ color: template.colors.muted }">{{ item.variantName }}</p></div><p class="text-xs font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(item.priceKobo * item.quantity) }}</p>
              </div>
            </div>
            <div class="mt-4 flex justify-between border-t pt-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }"><span class="font-bold" :style="{ color: template.colors.ink }">Total</span><span class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(cart.subtotalKobo) }}</span></div>
            <button class="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold disabled:opacity-50" :style="{ background: template.colors.primary, color: template.colors.onPrimary }" :disabled="submitting || !cart.items.length" @click="submit">{{ submitting ? 'Placing order…' : form.payOnline ? 'Pay and place order' : 'Place order' }}</button>
            <p class="mt-2 text-center text-[10px]" :style="{ color: template.colors.muted }">You'll get a tracking link after ordering.</p>
          </div>
        </div>
      </template>
    </div>
    </ClientOnly>
  </StorefrontShell>
</template>
