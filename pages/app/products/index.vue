<script setup lang="ts">
import { AlertTriangle, Boxes, Package, Plus, Search, SlidersHorizontal } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
import { titleCase } from '~/utils/entities';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Products' });
const toast = useToast();
const { items, meta, loading, categories, filters, load, loadExtras, deactivate } = useProducts();
const confirmOpen = ref(false);
const selected = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => [filters.category, filters.status], () => load());
async function remove() {
  if (!selected.value) return;
  try { await deactivate(selected.value); toast.success('Product hidden from your storefront.'); confirmOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(async () => { await Promise.all([load(), loadExtras()]); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Products" subtitle="Everything you sell, with the real cost and stock in one place." eyebrow="Catalog">
      <template #actions><BaseButton to="/app/products/new"><Plus class="h-4 w-4" /> Add product</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Products</p><p class="mt-1 font-display text-2xl font-bold">{{ meta.total }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Low stock</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ items.filter((p) => p.stockStatus !== 'healthy').length }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Stock value</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(items.reduce((s, p) => s + p.quantity * p.costPriceKobo, 0)) }}</p></div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="filters.search" type="search" placeholder="Search products or SKU…" class="input-base pl-11" aria-label="Search products">
      </div>
      <BaseSelect v-model="filters.category" :options="[{ value: 'all', label: 'All categories' }, ...categories.map((cat) => ({ value: cat, label: cat }))]" aria-label="Filter by category" class="!w-48" />
      <BaseSelect v-model="filters.status" :options="[{ value: 'all', label: 'All stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }, { value: 'inactive', label: 'Hidden' }]" aria-label="Filter by stock" class="!w-40" />
    </div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><div v-for="i in 6" :key="i" class="skeleton h-56 rounded-3xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No products yet" message="Add what you sell once. It powers your stock, sales, receipts and free website." action-label="Add your first product" @action="navigateTo('/app/products/new')">
      <template #icon><Package class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="product in items" :key="product.id" class="group card overflow-hidden p-0 transition hover:shadow-lift">
        <NuxtLink :to="`/app/products/${product.id}`" class="block">
          <div class="relative aspect-[4/3] overflow-hidden bg-raised">
            <img v-if="product.images[0]" :src="optimizedImage(product.images[0], 500)" :alt="product.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
            <div v-else class="flex h-full items-center justify-center"><Package class="h-10 w-10 text-muted/30" /></div>
            <div class="absolute left-3 top-3 flex gap-1.5">
              <BaseBadge v-if="!product.isActive" variant="neutral">Hidden</BaseBadge>
              <BaseBadge v-if="product.stockStatus === 'out'" variant="danger" dot>Out of stock</BaseBadge>
              <BaseBadge v-else-if="product.stockStatus === 'low'" variant="warning" dot>Low stock</BaseBadge>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0"><p class="truncate font-bold">{{ product.name }}</p><p class="text-[11px] text-muted">{{ titleCase(product.category) }} · {{ product.variantCount }} variant{{ product.variantCount === 1 ? '' : 's' }}</p></div>
              <p class="shrink-0 font-display text-lg font-bold">{{ formatNaira(product.priceKobo) }}</p>
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px]">
              <span :class="product.quantity <= 0 ? 'font-bold text-danger' : product.stockStatus === 'low' ? 'font-bold text-warning' : 'text-muted'">{{ product.quantity }} in stock</span>
              <span class="text-muted">Cost {{ formatNaira(product.costPriceKobo) }}</span>
            </div>
          </div>
        </NuxtLink>
        <div class="flex gap-1 border-t border-line p-2">
          <NuxtLink :to="`/app/stock?product=${product.id}`" class="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-raised hover:text-ink"><Boxes class="h-3.5 w-3.5" /> Stock</NuxtLink>
          <NuxtLink :to="`/app/products/${product.id}`" class="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-raised hover:text-ink"><SlidersHorizontal class="h-3.5 w-3.5" /> Edit</NuxtLink>
          <button type="button" class="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold text-danger hover:bg-danger/5" @click="selected = product.id; confirmOpen = true"><AlertTriangle class="h-3.5 w-3.5" /> Hide</button>
        </div>
      </div>
    </div>

    <div v-if="meta.pages > 1" class="flex justify-center gap-2">
      <BaseButton variant="outline" size="sm" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton>
      <span class="flex items-center px-3 text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span>
      <BaseButton variant="outline" size="sm" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton>
    </div>

    <ConfirmDialog v-model:open="confirmOpen" danger title="Hide this product?" message="It will disappear from your storefront but stay in your records. You can make it visible again when you edit it." confirm-label="Hide product" @confirm="remove" />
  </div>
</template>
