<script setup lang="ts">
import { ArrowDownRight, ArrowUpRight, Boxes, ClipboardList, PackageOpen, RefreshCw, SlidersHorizontal } from 'lucide-vue-next';
import { formatNaira, nairaToKobo } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
import { titleCase } from '~/utils/entities';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Stock' });
const route = useRoute();
const toast = useToast();
const stock = useStock();
const products = useProducts();
const lowStockModal = ref(false);
const adjustOpen = ref(false);
const restockVariantId = ref('');
const restockProductId = ref('');
const restockQty = ref('10');
const restockCost = ref('');
const adjustDelta = ref('-1');
const adjustNote = ref('');
const adjustVariantId = ref('');
const adjustProductId = ref('');
const productsLoading = ref(false);
const allProducts = computed(() => products.allProducts.value);

const flatVariants = computed(() => allProducts.value.flatMap((p) => p.variants.map((v) => ({
  label: `${p.name} · ${v.name}`, value: `${p.id}|${v.id || v._id}`, productId: p.id, variantId: v.id || v._id || '', quantity: v.quantity, cost: v.costPriceKobo,
}))));
const selectedRestock = computed(() => flatVariants.value.find((v) => v.value === restockVariantId.value));
const selectedAdjust = computed(() => flatVariants.value.find((v) => v.value === adjustVariantId.value));
const variantOptions = computed(() => flatVariants.value.map((v) => ({ value: v.value, label: `${v.label} (${v.quantity} left)` })));

async function loadProducts() {
  productsLoading.value = true;
  try {
    const result = { items: await products.loadAll() };
    const queryProduct = typeof route.query.product === 'string' ? route.query.product : '';
    const firstLow = stock.movements.value.length ? null : result.items.find((p) => p.stockStatus !== 'healthy');
    const first = result.items.find((p) => p.id === queryProduct) || firstLow || result.items[0];
    if (first?.variants[0]) {
      restockProductId.value = first.id;
      restockVariantId.value = `${first.id}|${first.variants[0].id || first.variants[0]._id}`;
      adjustProductId.value = first.id;
      adjustVariantId.value = `${first.id}|${first.variants[0].id || first.variants[0]._id}`;
    }
  } finally { productsLoading.value = false; }
}
function openRestockFromLow(item: { productId: string; variantId: string }) {
  restockProductId.value = item.productId;
  restockVariantId.value = `${item.productId}|${item.variantId}`;
  restockQty.value = '10';
  lowStockModal.value = true;
}
async function doRestock() {
  const target = flatVariants.value.find((v) => v.value === restockVariantId.value);
  if (!target) return;
  try {
    await stock.restock(target.productId, {
      variantId: target.variantId, quantity: Number(restockQty.value),
      ...(restockCost.value ? { unitCostKobo: nairaToKobo(restockCost.value) } : {}),
      note: 'Quick restock',
    });
    toast.success(`${target.label} restocked.`);
    lowStockModal.value = false;
    await Promise.all([stock.load(), loadProducts()]);
  } catch (error) { toast.error((error as Error).message); }
}
async function doAdjust() {
  const target = flatVariants.value.find((v) => v.value === adjustVariantId.value);
  if (!target) return;
  if (!adjustNote.value.trim()) { toast.error('Add a reason for the adjustment.'); return; }
  try {
    await stock.adjust(target.productId, { variantId: target.variantId, delta: Number(adjustDelta.value), note: adjustNote.value });
    toast.success('Stock adjusted and logged.');
    adjustOpen.value = false; adjustNote.value = '';
    await Promise.all([stock.load(), loadProducts()]);
  } catch (error) { toast.error((error as Error).message); }
}
const typeStyle: Record<string, string> = { sale: 'text-danger', restock: 'text-success', return: 'text-success', adjustment: 'text-warning', initial: 'text-muted', cancellation: 'text-success' };
onMounted(async () => { await Promise.all([stock.load(), loadProducts()]); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Stock" subtitle="Every movement is traceable. No more “I think we have three left”." eyebrow="Inventory">
      <template #actions>
        <BaseButton variant="outline" @click="adjustOpen = true"><SlidersHorizontal class="h-4 w-4" /> Adjust</BaseButton>
        <BaseButton @click="lowStockModal = true"><RefreshCw class="h-4 w-4" /> Restock</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Units in stock</p><p class="mt-1 font-display text-3xl font-bold">{{ stock.summary.value?.units || 0 }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Stock at cost</p><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(stock.summary.value?.costValueKobo) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Retail value</p><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(stock.summary.value?.retailValueKobo) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Needs attention</p><p class="mt-1 font-display text-3xl font-bold text-warning">{{ (stock.summary.value?.lowStock || 0) + (stock.summary.value?.outOfStock || 0) }}</p></div>
    </div>

    <BaseCard v-if="products.lowStock.value.length" class="border-warning/30 bg-warning/5">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning"><PackageOpen class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-lg font-bold">Running low ({{ products.lowStock.value.length }})</h2>
          <div class="mt-3 grid gap-2 lg:grid-cols-2">
            <div v-for="item in products.lowStock.value.slice(0, 6)" :key="item.variantId" class="flex items-center gap-3 rounded-xl bg-surface p-3">
              <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold">{{ item.name }}</p><p class="text-[10px] text-muted">{{ item.variantName }}</p></div>
              <BaseBadge :variant="item.outOfStock ? 'danger' : 'warning'">{{ item.outOfStock ? 'Out' : `${item.quantity} left` }}</BaseBadge>
              <BaseButton size="sm" variant="outline" @click="openRestockFromLow(item)">Restock</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="font-display text-xl font-bold">Stock ledger</h2>
      <div class="flex gap-2">
        <BaseSelect v-model="stock.filters.type" :options="[{ value: '', label: 'All movements' }, { value: 'sale', label: 'Sales' }, { value: 'restock', label: 'Restocks' }, { value: 'adjustment', label: 'Adjustments' }, { value: 'return', label: 'Returns' }, { value: 'initial', label: 'Opening stock' }]" aria-label="Movement type" class="!w-44" size="sm" @change="stock.filters.page = 1; stock.load()" />
        <BaseButton variant="ghost" size="sm" @click="stock.load"><RefreshCw class="h-4 w-4" /></BaseButton>
      </div>
    </div>

    <BaseTable :loading="stock.loading.value">
      <template #head><tr><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Item</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Type</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Change</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Balance</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">When</th></tr></template>
      <template #body>
        <tr v-for="movement in stock.movements.value" :key="String(movement._id || movement.id)" class="border-b border-line last:border-0 hover:bg-raised/40">
          <td class="px-4 py-3"><p class="text-xs font-bold">{{ movement.productName }}</p><p class="text-[10px] text-muted">{{ movement.variantName }}</p></td>
          <td class="px-4 py-3"><span class="text-[11px] font-bold" :class="typeStyle[String(movement.type)] || 'text-muted'">{{ titleCase(String(movement.type)) }}</span></td>
          <td class="px-4 py-3 text-right"><span class="inline-flex items-center gap-1 text-xs font-bold" :class="Number(movement.quantityDelta) > 0 ? 'text-success' : 'text-danger'"><ArrowUpRight v-if="Number(movement.quantityDelta) > 0" class="h-3 w-3" /><ArrowDownRight v-else class="h-3 w-3" />{{ Number(movement.quantityDelta) > 0 ? '+' : '' }}{{ movement.quantityDelta }}</span></td>
          <td class="px-4 py-3 text-right text-xs font-semibold">{{ movement.quantityAfter }}</td>
          <td class="px-4 py-3 text-[11px] text-muted">{{ formatDateTime(String(movement.createdAt)) }}</td>
        </tr>
        <tr v-if="!stock.movements.value.length"><td colspan="5"><BaseEmptyState compact title="No stock movements yet" message="Restock a product or record a sale to start the ledger." /></td></tr>
      </template>
    </BaseTable>
    <div v-if="stock.meta.pages > 1" class="flex justify-center gap-2">
      <BaseButton size="sm" variant="outline" :disabled="stock.filters.page <= 1" @click="stock.filters.page--; stock.load()">Previous</BaseButton>
      <span class="flex items-center text-xs text-muted">Page {{ stock.filters.page }} of {{ stock.meta.pages }}</span>
      <BaseButton size="sm" variant="outline" :disabled="stock.filters.page >= stock.meta.pages" @click="stock.filters.page++; stock.load()">Next</BaseButton>
    </div>

    <BaseModal v-model:open="lowStockModal" title="Restock a product" description="Choose the exact variant and add stock. The ledger records it automatically.">
      <div class="space-y-4">
        <BaseSelect v-model="restockVariantId" label="Product variant" :options="variantOptions" :disabled="productsLoading" required />
        <div class="grid gap-3 sm:grid-cols-2">
          <BaseInput v-model="restockQty" label="Quantity added" type="number" inputmode="numeric" />
          <BaseInput v-model="restockCost" label="New cost per unit (optional)" prefix="₦" inputmode="decimal" />
        </div>
        <div class="flex flex-wrap gap-2"><button v-for="qty in ['5','10','20','50']" :key="qty" type="button" class="rounded-full border border-line px-3 py-1.5 text-xs font-bold hover:border-ink" @click="restockQty = qty">+{{ qty }}</button></div>
        <div v-if="selectedRestock" class="rounded-xl bg-raised/60 p-3 text-xs text-muted">Current: <strong class="text-ink">{{ selectedRestock.quantity }} units</strong>. After restock: <strong class="text-success">{{ selectedRestock.quantity + Number(restockQty || 0) }} units</strong>.</div>
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="lowStockModal = false">Cancel</BaseButton><BaseButton :loading="stock.saving.value" @click="doRestock">Add to stock</BaseButton></div>
    </BaseModal>

    <BaseModal v-model:open="adjustOpen" title="Adjust stock" description="Use this for damage, theft, lost items or a correction. Every change needs a reason.">
      <div class="space-y-4">
        <BaseSelect v-model="adjustVariantId" label="Product variant" :options="variantOptions" required />
        <BaseInput v-model="adjustDelta" label="Change (use - for a reduction)" type="number" hint="Example: -2 means two units are gone." />
        <BaseTextarea v-model="adjustNote" label="Why?" placeholder="Two caps damaged in transit" required />
        <div v-if="selectedAdjust" class="rounded-xl bg-raised/60 p-3 text-xs text-muted">Current: <strong class="text-ink">{{ selectedAdjust.quantity }}</strong>. New balance: <strong class="text-ink">{{ Math.max(0, selectedAdjust.quantity + Number(adjustDelta || 0)) }}</strong>.</div>
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="adjustOpen = false">Cancel</BaseButton><BaseButton :loading="stock.saving.value" @click="doAdjust">Record adjustment</BaseButton></div>
    </BaseModal>
  </div>
</template>
