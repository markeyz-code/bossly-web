<script setup lang="ts">
import { ArrowLeft, Check, Minus, Plus, Search, ShoppingBag } from 'lucide-vue-next';
import { formatNaira, nairaToKobo, nairaInput } from '~/utils/money';
import { addDaysInput, todayInput } from '~/utils/date';
import { optimizedImage } from '~/utils/cloudinary';
import type { Product } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'New order' });
const router = useRouter();
const toast = useToast();
const productCatalog = useProducts();
const orderApi = useOrders();
const products = computed(() => productCatalog.allProducts.value);
const loading = ref(true);
const saving = ref(false);
const search = ref('');
const variantsOpen = ref(false);
const chosen = ref<Product | null>(null);
const chosenVariantId = ref('');
const chosenQty = ref(1);
interface Line { productId: string; variantId: string; name: string; variantName: string; priceKobo: number; quantity: number; max: number; image?: string }
const lines = ref<Line[]>([]);
const customer = reactive({ name: '', phone: '', email: '', address: '', details: '' });
const discount = ref('');
const delivery = ref('');
const amountPaid = ref('');
const paymentStatus = ref<'paid' | 'part' | 'later'>('later');
const dueDate = ref(addDaysInput(7));
const notes = ref('');
const filtered = computed(() => products.value.filter((p) => !search.value || p.name.toLowerCase().includes(search.value.toLowerCase())).slice(0, 18));
const subtotal = computed(() => lines.value.reduce((s, l) => s + l.priceKobo * l.quantity, 0));
const total = computed(() => Math.max(0, subtotal.value - nairaToKobo(discount.value) + nairaToKobo(delivery.value)));
const paid = computed(() => paymentStatus.value === 'paid' ? total.value : paymentStatus.value === 'later' ? 0 : Math.min(nairaToKobo(amountPaid.value), total.value));
function pick(product: Product) {
  if (product.variants.length === 1) return addLine(product, product.variants[0]);
  chosen.value = product; chosenVariantId.value = product.variants.find((v) => v.quantity > 0)?.id || product.variants[0].id || ''; chosenQty.value = 1; variantsOpen.value = true;
}
function addLine(product: Product, variant: Product['variants'][number]) {
  if (variant.quantity <= 0) { toast.warning('Out of stock.'); return; }
  const id = variant.id || variant._id || '';
  const existing = lines.value.find((l) => l.variantId === id);
  if (existing) existing.quantity = Math.min(existing.max, existing.quantity + 1);
  else lines.value.push({ productId: product.id, variantId: id, name: product.name, variantName: variant.name, priceKobo: variant.priceKobo, quantity: 1, max: variant.quantity, image: product.images[0] });
}
function confirmVariant() {
  if (!chosen.value) return;
  const variant = chosen.value.variants.find((v) => (v.id || v._id) === chosenVariantId.value);
  if (variant) for (let i = 0; i < chosenQty.value; i++) addLine(chosen.value, variant);
  variantsOpen.value = false;
}
function setQty(line: Line, qty: number) { if (qty <= 0) lines.value = lines.value.filter((l) => l.variantId !== line.variantId); else line.quantity = Math.min(line.max, qty); }
async function submit() {
  if (!customer.name.trim() || !customer.phone.trim()) { toast.error('Customer name and phone are required.'); return; }
  if (!lines.value.length) { toast.error('Add at least one product.'); return; }
  saving.value = true;
  try {
    const order = await orderApi.create({
      customerName: customer.name, customerPhone: customer.phone, customerEmail: customer.email || undefined,
      deliveryAddress: customer.address, deliveryDetails: customer.details,
      items: lines.value.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
      discountKobo: nairaToKobo(discount.value), deliveryFeeKobo: nairaToKobo(delivery.value),
      amountPaidKobo: paid.value, paymentMethod: 'cash', dueDate: paymentStatus.value !== 'paid' ? dueDate.value : undefined,
      createDebtNow: paymentStatus.value !== 'paid', notes: notes.value, source: 'manual',
    });
    toast.success(`${order.orderNumber} created.`);
    await router.push(`/app/orders/${order.id}`);
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
onMounted(async () => { try { await productCatalog.loadAll(); } finally { loading.value = false; } });
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3"><NuxtLink to="/app/orders" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">Fulfilment</p><h1 class="font-display text-3xl font-bold tracking-tight">Create an order</h1></div></div>
    <div class="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <div class="space-y-5">
        <BaseCard><h2 class="font-display text-lg font-bold">Customer & delivery</h2><div class="mt-4 grid gap-3 sm:grid-cols-2">
          <BaseInput v-model="customer.name" label="Customer name" required /><BaseInput v-model="customer.phone" label="Phone" inputmode="tel" required />
          <BaseInput v-model="customer.email" label="Email (optional)" type="email" /><BaseInput v-model="customer.address" label="Delivery address" placeholder="Yaba, Lagos" />
          <div class="sm:col-span-2"><BaseInput v-model="customer.details" label="Delivery notes" placeholder="Near the school gate, call when you arrive" /></div>
        </div></BaseCard>
        <BaseCard>
          <h2 class="font-display text-lg font-bold">Items</h2>
          <div class="relative mt-3"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="search" type="search" placeholder="Search products…" class="input-base pl-11"></div>
          <div v-if="loading" class="mt-3 grid grid-cols-2 gap-2"><div v-for="i in 4" :key="i" class="skeleton h-20 rounded-xl" /></div>
          <div v-else class="mt-3 grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            <button v-for="product in filtered" :key="product.id" class="flex items-center gap-2 rounded-xl border border-line p-2 text-left hover:border-brand disabled:opacity-50" :disabled="product.stockStatus === 'out'" @click="pick(product)">
              <div class="h-10 w-10 overflow-hidden rounded-lg bg-raised"><img v-if="product.images[0]" :src="optimizedImage(product.images[0], 80)" class="h-full w-full object-cover"></div>
              <div class="min-w-0"><p class="truncate text-[11px] font-bold">{{ product.name }}</p><p class="text-[10px] text-muted">{{ formatNaira(product.priceKobo) }} · {{ product.quantity }} left</p></div>
            </button>
          </div>
          <div v-if="lines.length" class="mt-4 divide-y divide-line">
            <div v-for="line in lines" :key="line.variantId" class="flex items-center gap-2 py-2.5">
              <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold">{{ line.name }}</p><p class="text-[10px] text-muted">{{ line.variantName }}</p></div>
              <div class="flex items-center gap-1 rounded-lg border border-line p-0.5"><button class="flex h-7 w-7 items-center justify-center" @click="setQty(line, line.quantity - 1)"><Minus class="h-3 w-3" /></button><span class="w-5 text-center text-xs font-bold">{{ line.quantity }}</span><button class="flex h-7 w-7 items-center justify-center" @click="setQty(line, line.quantity + 1)"><Plus class="h-3 w-3" /></button></div>
              <p class="w-20 text-right text-xs font-bold">{{ formatNaira(line.priceKobo * line.quantity) }}</p>
            </div>
          </div>
        </BaseCard>
      </div>
      <div class="space-y-4 xl:sticky xl:top-[84px] xl:self-start">
        <BaseCard>
          <h2 class="font-display text-lg font-bold">Payment</h2>
          <div class="mt-3 grid grid-cols-2 gap-2"><BaseInput v-model="discount" label="Discount" prefix="₦" inputmode="decimal" /><BaseInput v-model="delivery" label="Delivery" prefix="₦" inputmode="decimal" /></div>
          <div class="mt-3 flex items-baseline justify-between border-y border-line py-3"><span class="font-bold">Total</span><span class="font-display text-2xl font-bold">{{ formatNaira(total) }}</span></div>
          <div class="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-line p-1">
            <button v-for="mode in [{ key: 'paid', label: 'Paid' }, { key: 'part', label: 'Part' }, { key: 'later', label: 'Pay later' }]" :key="mode.key" class="rounded-lg py-2 text-[11px] font-bold" :class="paymentStatus === mode.key ? 'bg-ink text-canvas' : 'text-muted hover:bg-raised'" @click="paymentStatus = mode.key as typeof paymentStatus">{{ mode.label }}</button>
          </div>
          <div v-if="paymentStatus === 'part'" class="mt-3"><BaseInput v-model="amountPaid" label="Amount paid now" prefix="₦" inputmode="decimal" /></div>
          <div v-if="paymentStatus !== 'paid'" class="mt-3"><BaseDatePicker v-model="dueDate" label="Balance due" :min="todayInput()" /></div>
          <div class="mt-3"><BaseTextarea v-model="notes" label="Order note" :rows="2" /></div>
          <BaseButton block size="lg" class="mt-4" :loading="saving" :disabled="!lines.length" @click="submit"><Check class="h-5 w-5" /> Create order</BaseButton>
          <p class="mt-2 text-center text-[10px] text-muted">Stock is reserved immediately. Confirm the order to create the sale.</p>
        </BaseCard>
      </div>
    </div>
    <BaseModal v-model:open="variantsOpen" title="Choose an option" :description="chosen?.name">
      <BaseSelect v-model="chosenVariantId" label="Variant" :options="(chosen?.variants || []).filter((v) => v.quantity > 0).map((v) => ({ value: v.id || v._id || '', label: `${v.name} — ${formatNaira(v.priceKobo)}` }))" />
      <div class="mt-3"><BaseInput v-model.number="chosenQty" label="Quantity" type="number" min="1" /></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="variantsOpen = false">Cancel</BaseButton><BaseButton @click="confirmVariant">Add item</BaseButton></div>
    </BaseModal>
  </div>
</template>
