<script setup lang="ts">
import { ArrowLeft, Check, Minus, Plus, Search, ShoppingBag, Sparkles, Trash2, UserPlus } from 'lucide-vue-next';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';
import { addDaysInput, todayInput } from '~/utils/date';
import { optimizedImage } from '~/utils/cloudinary';
import type { Product, Variant } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Record a sale' });
const router = useRouter();
const route = useRoute();
const toast = useToast();
const businessStore = useBusinessStore();
const { submit, saving } = useCreateSale();
const onboarding = computed(() => route.query.onboarding === '1');
const catalog = useProducts();
const allProducts = computed(() => catalog.allProducts.value);
const loadingProducts = ref(true);
const search = ref('');
const variantOpen = ref(false);
const chosenProduct = ref<Product | null>(null);
const chosenVariantId = ref('');
const chosenQuantity = ref(1);
interface Line { productId: string; variantId: string; name: string; variantName: string; price: string; costKobo: number; quantity: number; max: number; image?: string }
const lines = ref<Line[]>([]);
const customer = reactive({ name: '', phone: '', email: '' });
const paymentMode = ref<'full' | 'part' | 'later'>('full');
const amountPaidInput = ref('');
const dueDate = ref(addDaysInput(7));
const discount = ref('');
const delivery = ref('');
const paymentMethod = ref('cash');
const notes = ref('');
const submitting = ref(false);

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  return allProducts.value.filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 24);
});
const subtotalKobo = computed(() => lines.value.reduce((s, l) => s + nairaToKobo(l.price) * l.quantity, 0));
const costKobo = computed(() => lines.value.reduce((s, l) => s + l.costKobo * l.quantity, 0));
const totalKobo = computed(() => Math.max(0, subtotalKobo.value - nairaToKobo(discount.value) + nairaToKobo(delivery.value)));
const amountPaidKobo = computed(() => {
  if (paymentMode.value === 'full') return totalKobo.value;
  if (paymentMode.value === 'later') return 0;
  return Math.min(nairaToKobo(amountPaidInput.value), totalKobo.value);
});
const owedKobo = computed(() => Math.max(0, totalKobo.value - amountPaidKobo.value));
const profitKobo = computed(() => totalKobo.value - costKobo.value);

function pickProduct(product: Product) {
  if (!product.variants.length) return;
  if (product.variants.length === 1) {
    addVariant(product, product.variants[0]);
    return;
  }
  chosenProduct.value = product;
  chosenVariantId.value = product.variants.find((v) => v.isActive && v.quantity > 0)?.id || product.variants[0].id || '';
  chosenQuantity.value = 1;
  variantOpen.value = true;
}
function addVariant(product: Product, variant: Variant) {
  const variantId = variant.id || variant._id || '';
  if (variant.quantity <= 0) { toast.warning('That variant is out of stock.'); return; }
  const existing = lines.value.find((l) => l.variantId === variantId);
  if (existing) { existing.quantity = Math.min(existing.max, existing.quantity + 1); return; }
  lines.value.push({
    productId: product.id, variantId, name: product.name, variantName: variant.name,
    price: nairaInput(variant.priceKobo), costKobo: variant.costPriceKobo,
    quantity: 1, max: variant.quantity, image: product.images[0],
  });
  toast.success(`${product.name} added.`);
}
function confirmVariant() {
  if (!chosenProduct.value) return;
  const variant = chosenProduct.value.variants.find((v) => (v.id || v._id) === chosenVariantId.value);
  if (!variant) return;
  for (let i = 0; i < chosenQuantity.value; i++) addVariant(chosenProduct.value, variant);
  variantOpen.value = false;
}
function setQty(line: Line, quantity: number) {
  if (quantity <= 0) { lines.value = lines.value.filter((l) => l.variantId !== line.variantId); return; }
  line.quantity = Math.min(line.max, quantity);
}
async function submitSale() {
  if (!lines.value.length) { toast.error('Add at least one product to the sale.'); return; }
  if (paymentMode.value !== 'full' && !customer.phone.trim()) { toast.error('Add the customer’s phone number to track what they owe.'); return; }
  if (paymentMode.value === 'part' && amountPaidKobo.value <= 0) { toast.error('Enter how much the customer paid.'); return; }
  submitting.value = true;
  try {
    const result = await submit({
      customerName: customer.name || 'Walk-in customer',
      customerPhone: customer.phone || undefined,
      customerEmail: customer.email || undefined,
      items: lines.value.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity, unitPriceKobo: nairaToKobo(l.price) })),
      discountKobo: nairaToKobo(discount.value),
      deliveryFeeKobo: nairaToKobo(delivery.value),
      amountPaidKobo: amountPaidKobo.value,
      paymentMethod: paymentMethod.value,
      dueDate: paymentMode.value !== 'full' ? dueDate.value : undefined,
      notes: notes.value,
      source: 'manual',
    });
    if ('queued' in result) { await router.push('/app/offline'); return; }
    await businessStore.refreshOnboarding();
    toast.success(`${result.saleNumber} recorded. Profit: ${formatNaira(result.grossProfitKobo)}.`, 'Sale in the books');
    await router.push(onboarding.value ? '/app/reports?welcome=1' : '/app/sales');
  } catch (error) {
    toast.error((error as Error).message);
  } finally { submitting.value = false; }
}
onMounted(async () => {
  try {
    await catalog.loadAll();
  } finally { loadingProducts.value = false; }
});
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3">
      <NuxtLink to="/app" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink>
      <div><p class="eyebrow">{{ onboarding ? 'Step 3 of 3' : 'Sales' }}</p><h1 class="font-display text-3xl font-bold tracking-tight">Record a sale</h1></div>
    </div>
    <div v-if="onboarding" class="rounded-2xl border border-success/30 bg-success/5 p-4 text-sm font-medium text-success">Almost there. Record one real sale and Bossly will show you exactly what you made.</div>

    <div class="grid gap-5 xl:grid-cols-[1.35fr_1fr]" data-tour="sale-form">
      <div class="space-y-5">
        <BaseCard>
          <div class="flex items-center gap-2"><UserPlus class="h-4 w-4 text-brand-500" /><h2 class="font-display text-lg font-bold">Who’s buying?</h2><span class="text-[11px] text-muted">Optional for cash sales</span></div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <BaseInput v-model="customer.name" label="Customer name" placeholder="Tola Bakare" />
            <BaseInput v-model="customer.phone" label="Phone number" inputmode="tel" placeholder="0803 123 4567" />
            <div class="sm:col-span-2"><BaseInput v-model="customer.email" label="Email (optional)" type="email" placeholder="For receipts and reminders" /></div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center justify-between gap-2"><div><h2 class="font-display text-lg font-bold">What did they buy?</h2><p class="text-[11px] text-muted">Tap a product to add it.</p></div><span class="rounded-full bg-raised px-2.5 py-1 text-[10px] font-bold">{{ lines.length }} item{{ lines.length === 1 ? '' : 's' }}</span></div>
          <div class="relative mt-4"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="search" type="search" placeholder="Search your catalog…" class="input-base pl-11" aria-label="Search catalog"></div>
          <div v-if="loadingProducts" class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"><div v-for="i in 6" :key="i" class="skeleton h-24 rounded-2xl" /></div>
          <div v-else-if="!allProducts.length" class="mt-4 rounded-2xl border border-dashed border-line p-6 text-center"><p class="text-sm font-bold">Your catalog is empty</p><p class="mt-1 text-xs text-muted">Add a product before recording a sale.</p><BaseButton to="/app/products/new" size="sm" class="mt-3">Add product</BaseButton></div>
          <div v-else class="scrollbar-none mt-4 grid max-h-[330px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            <button v-for="product in filtered" :key="product.id" type="button" class="group flex items-center gap-2 rounded-xl border border-line bg-surface p-2 text-left transition hover:border-brand hover:shadow-soft disabled:opacity-50" :disabled="product.stockStatus === 'out'" @click="pickProduct(product)">
              <div class="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-raised"><img v-if="product.images[0]" :src="optimizedImage(product.images[0], 100)" :alt="product.name" class="h-full w-full object-cover"><div v-else class="flex h-full items-center justify-center"><ShoppingBag class="h-4 w-4 text-muted/40" /></div></div>
              <div class="min-w-0"><p class="truncate text-[11px] font-bold">{{ product.name }}</p><p class="text-[10px] text-muted">{{ formatNaira(product.priceKobo) }} · {{ product.quantity }} left</p></div>
            </button>
          </div>
          <p v-if="filtered.length && !lines.length" class="mt-3 text-[10px] text-muted">Tip: tap the same product again to increase quantity.</p>
        </BaseCard>

        <BaseCard v-if="lines.length">
          <h2 class="font-display text-lg font-bold">Sale items</h2>
          <div class="mt-3 divide-y divide-line">
            <div v-for="line in lines" :key="line.variantId" class="flex flex-wrap items-center gap-3 py-3">
              <div class="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-raised"><img v-if="line.image" :src="optimizedImage(line.image, 100)" :alt="line.name" class="h-full w-full object-cover"></div>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ line.name }}</p><p class="text-[10px] text-muted">{{ line.variantName }} · cost {{ formatNaira(line.costKobo) }}</p></div>
              <div class="flex items-center gap-1 rounded-xl border border-line p-1">
                <button class="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-raised" aria-label="Reduce quantity" @click="setQty(line, line.quantity - 1)"><Minus class="h-3.5 w-3.5" /></button>
                <span class="w-6 text-center text-xs font-bold">{{ line.quantity }}</span>
                <button class="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-raised" aria-label="Increase quantity" @click="setQty(line, line.quantity + 1)"><Plus class="h-3.5 w-3.5" /></button>
              </div>
              <input v-model="line.price" class="w-24 rounded-xl border border-line bg-surface px-2 py-2 text-right text-xs font-bold" inputmode="decimal" aria-label="Unit price">
              <p class="w-20 text-right text-sm font-bold">{{ formatNaira(nairaToKobo(line.price) * line.quantity) }}</p>
              <button class="text-muted hover:text-danger" aria-label="Remove" @click="setQty(line, 0)"><Trash2 class="h-4 w-4" /></button>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="space-y-5 xl:sticky xl:top-[84px] xl:self-start">
        <BaseCard>
          <h2 class="font-display text-lg font-bold">The money</h2>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <BaseInput v-model="discount" label="Discount" prefix="₦" inputmode="decimal" placeholder="0" />
            <BaseInput v-model="delivery" label="Delivery fee" prefix="₦" inputmode="decimal" placeholder="0" />
          </div>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd class="font-semibold">{{ formatNaira(subtotalKobo) }}</dd></div>
            <div v-if="nairaToKobo(discount)" class="flex justify-between"><dt class="text-muted">Discount</dt><dd class="text-success">-{{ formatNaira(nairaToKobo(discount)) }}</dd></div>
            <div v-if="nairaToKobo(delivery)" class="flex justify-between"><dt class="text-muted">Delivery</dt><dd>{{ formatNaira(nairaToKobo(delivery)) }}</dd></div>
            <div class="flex items-baseline justify-between border-t border-line pt-2"><dt class="font-bold">Total</dt><dd class="font-display text-2xl font-bold">{{ formatNaira(totalKobo) }}</dd></div>
          </dl>
          <div class="mt-2 rounded-xl bg-success/10 px-3 py-2 text-[11px] font-semibold text-success">Estimated profit: {{ formatNaira(profitKobo) }}</div>

          <div class="mt-4">
            <p class="label-base">Payment</p>
            <div class="grid grid-cols-3 gap-1 rounded-xl border border-line p-1">
              <button v-for="mode in [{ key: 'full', label: 'Paid' }, { key: 'part', label: 'Part' }, { key: 'later', label: 'Pay later' }]" :key="mode.key" type="button" class="rounded-lg py-2 text-[11px] font-bold" :class="paymentMode === mode.key ? 'bg-ink text-canvas' : 'text-muted hover:bg-raised'" @click="paymentMode = mode.key as typeof paymentMode">{{ mode.label }}</button>
            </div>
          </div>
          <div v-if="paymentMode === 'part'" class="mt-3"><BaseInput v-model="amountPaidInput" label="Amount paid now" prefix="₦" inputmode="decimal" :hint="`Balance: ${formatNaira(owedKobo)}`" /></div>
          <div v-if="paymentMode !== 'full'" class="mt-3"><BaseDatePicker v-model="dueDate" label="Balance due on" :min="todayInput()" /></div>
          <div class="mt-3"><BaseSelect v-model="paymentMethod" label="Payment method" :options="[{ value: 'cash', label: 'Cash' }, { value: 'transfer', label: 'Bank transfer' }, { value: 'pos', label: 'POS' }, { value: 'paystack', label: 'Paystack' }, { value: 'other', label: 'Other' }]" /></div>
          <div class="mt-3"><BaseTextarea v-model="notes" label="Note (optional)" :rows="2" placeholder="Anything to remember" /></div>

          <BaseButton block size="lg" class="mt-4" :loading="saving || submitting" :disabled="!lines.length" @click="submitSale"><Check class="h-5 w-5" /> Save sale</BaseButton>
          <p v-if="paymentMode !== 'full'" class="mt-2 text-center text-[10px] text-muted">We’ll open a debt record automatically.</p>
        </BaseCard>
        <div class="rounded-2xl border border-line bg-raised/50 p-3 text-[11px] leading-relaxed text-muted"><Sparkles class="mr-1 inline h-3.5 w-3.5 text-brand-500" />Offline? No problem. The sale is saved on this device and syncs when you’re back.</div>
      </div>
    </div>

    <BaseModal v-model:open="variantOpen" title="Choose an option" :description="chosenProduct?.name">
      <div class="space-y-3">
        <BaseSelect v-model="chosenVariantId" label="Variant" :options="(chosenProduct?.variants || []).filter((v) => v.quantity > 0).map((v) => ({ value: v.id || v._id || '', label: `${v.name} — ${formatNaira(v.priceKobo)} (${v.quantity} left)` }))" />
        <BaseInput v-model.number="chosenQuantity" label="How many?" type="number" min="1" />
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="variantOpen = false">Cancel</BaseButton><BaseButton @click="confirmVariant">Add to sale</BaseButton></div>
    </BaseModal>
  </div>
</template>
