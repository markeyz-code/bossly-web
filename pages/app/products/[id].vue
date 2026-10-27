<script setup lang="ts">
import { ArrowLeft, Boxes, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';
import { titleCase } from '~/utils/entities';
import type { ProductPayload } from '~/api/types';
import type { Variant } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Edit product' });
const route = useRoute();
const router = useRouter();
const toast = useToast();
const productId = computed(() => String(route.params.id));
const { product, loading, saving, load, update, addVariant, updateVariant, removeVariant } = useProduct(productId.value);
const stock = useStock();
const products = useProducts();
const stockOpen = ref(false);
const variantFormOpen = ref(false);
const addOpen = ref(false);
const editingVariant = ref<Variant | null>(null);
const restockVariant = ref<Variant | null>(null);
const restockQty = ref('10');
const restockCost = ref('');
const variantData = reactive({ name: '', sku: '', colour: '', size: '', price: '', cost: '', quantity: '0', threshold: '3' });
const newVariant = reactive({ name: '', sku: '', colour: '', size: '', price: '', cost: '', quantity: '0', threshold: '3' });
const deleteVariant = ref<Variant | null>(null);
const confirmDeleteOpen = ref(false);

async function saveBasics(payload: ProductPayload) {
  try {
    await update(productId.value, {
      name: payload.name, description: payload.description, category: payload.category, sku: payload.sku,
      images: payload.images, tags: payload.tags, priceKobo: payload.priceKobo, costPriceKobo: payload.costPriceKobo,
      lowStockThreshold: payload.lowStockThreshold,
    });
    toast.success('Product updated.');
  } catch (error) { toast.error((error as Error).message); }
}
function openRestock(variant: Variant) {
  restockVariant.value = variant;
  restockQty.value = '10';
  restockCost.value = nairaInput(variant.costPriceKobo);
  stockOpen.value = true;
}
async function doRestock() {
  if (!restockVariant.value || !product.value) return;
  try {
    await stock.restock(product.value.id, {
      variantId: restockVariant.value.id || restockVariant.value._id || '',
      quantity: Number(restockQty.value),
      unitCostKobo: restockCost.value ? nairaToKobo(restockCost.value) : undefined,
      note: 'Quick restock',
    });
    toast.success('Stock updated.'); stockOpen.value = false; await load();
  } catch (error) { toast.error((error as Error).message); }
}
function openVariantForm(variant: Variant) {
  editingVariant.value = variant;
  variantData.name = variant.name; variantData.sku = variant.sku;
  variantData.colour = variant.attributes?.colour || ''; variantData.size = variant.attributes?.size || '';
  variantData.price = nairaInput(variant.priceKobo); variantData.cost = nairaInput(variant.costPriceKobo);
  variantData.quantity = String(variant.quantity); variantData.threshold = String(variant.lowStockThreshold);
  variantFormOpen.value = true;
}
async function saveVariant() {
  if (!editingVariant.value || !product.value) return;
  const id = editingVariant.value.id || editingVariant.value._id || '';
  try {
    await updateVariant(product.value.id, id, {
      name: variantData.name || [variantData.colour, variantData.size].filter(Boolean).join(' / '),
      sku: variantData.sku, attributes: Object.fromEntries(Object.entries({ colour: variantData.colour, size: variantData.size }).filter(([, v]) => v)),
      priceKobo: nairaToKobo(variantData.price), costPriceKobo: nairaToKobo(variantData.cost),
      lowStockThreshold: Number(variantData.threshold),
    });
    toast.success('Variant updated.'); variantFormOpen.value = false;
  } catch (error) { toast.error((error as Error).message); }
}
async function saveNewVariant() {
  if (!product.value) return;
  try {
    await addVariant(product.value.id, {
      name: newVariant.name || [newVariant.colour, newVariant.size].filter(Boolean).join(' / '),
      sku: newVariant.sku || undefined,
      attributes: Object.fromEntries(Object.entries({ colour: newVariant.colour, size: newVariant.size }).filter(([, v]) => v)),
      priceKobo: nairaToKobo(newVariant.price), costPriceKobo: nairaToKobo(newVariant.cost),
      quantity: Number(newVariant.quantity), lowStockThreshold: Number(newVariant.threshold),
    });
    toast.success('Variant added.'); addOpen.value = false;
    Object.assign(newVariant, { name: '', sku: '', colour: '', size: '', price: '', cost: '', quantity: '0', threshold: '3' });
  } catch (error) { toast.error((error as Error).message); }
}
async function doRemoveVariant() {
  if (!deleteVariant.value || !product.value) return;
  try {
    await removeVariant(product.value.id, deleteVariant.value.id || deleteVariant.value._id || '');
    toast.success('Variant removed.'); confirmDeleteOpen.value = false;
  } catch (error) { toast.error((error as Error).message); }
}
onMounted(async () => { await Promise.all([load(), products.loadExtras()]); });
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/app/products" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink>
        <div><p class="eyebrow">Edit product</p><h1 class="font-display text-3xl font-bold tracking-tight">{{ product?.name || 'Loading…' }}</h1></div>
      </div>
      <BaseBadge v-if="product" :variant="product.stockStatus === 'out' ? 'danger' : product.stockStatus === 'low' ? 'warning' : 'success'" dot>{{ product.quantity }} in stock</BaseBadge>
    </div>

    <div v-if="loading" class="space-y-4"><div class="skeleton h-72 rounded-3xl" /><div class="skeleton h-48 rounded-3xl" /></div>
    <template v-else-if="product">
      <ProductForm :product="product" :saving="saving" mode="edit" :categories="products.categories.value" @submit="saveBasics" @cancel="router.push('/app/products')" />

      <BaseCard>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div><h2 class="font-display text-xl font-bold">Variants & stock</h2><p class="mt-1 text-xs text-muted">Every option has its own stock count. Restocking is two taps.</p></div>
          <BaseButton size="sm" variant="outline" @click="addOpen = true"><Plus class="h-4 w-4" /> Add variant</BaseButton>
        </div>
        <div class="mt-4 space-y-2">
          <div v-for="variant in product.variants" :key="variant.id || variant._id" class="rounded-2xl border border-line p-3.5">
            <div class="flex flex-wrap items-center gap-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold">{{ variant.name }}</p>
                <p class="text-[11px] text-muted">{{ variant.sku }} · {{ titleCase(Object.values(variant.attributes || {}).join(' / ')) || 'Default' }}</p>
              </div>
              <div class="text-right"><p class="text-sm font-bold">{{ formatNaira(variant.priceKobo) }}</p><p class="text-[10px] text-muted">Cost {{ formatNaira(variant.costPriceKobo) }}</p></div>
              <BaseBadge :variant="variant.quantity <= 0 ? 'danger' : variant.quantity <= variant.lowStockThreshold ? 'warning' : 'success'">{{ variant.quantity }} left</BaseBadge>
              <div class="flex gap-1">
                <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-line hover:bg-raised" title="Restock" @click="openRestock(variant)"><Boxes class="h-4 w-4" /></button>
                <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-line hover:bg-raised" title="Edit variant" @click="openVariantForm(variant)"><Pencil class="h-4 w-4" /></button>
                <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-danger hover:bg-danger/5" title="Delete variant" :disabled="variant.quantity > 0" @click="deleteVariant = variant; confirmDeleteOpen = true"><Trash2 class="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>

    <BaseModal v-model:open="stockOpen" title="Restock" :description="restockVariant?.name">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="restockQty" label="Quantity added" type="number" inputmode="numeric" />
        <BaseInput v-model="restockCost" label="New cost per unit (optional)" prefix="₦" inputmode="decimal" />
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="stockOpen = false">Cancel</BaseButton><BaseButton :loading="stock.saving.value" @click="doRestock">Add stock</BaseButton></div>
    </BaseModal>

    <BaseModal v-model:open="variantFormOpen" title="Edit variant" description="Update the option, price or alert threshold.">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="variantData.name" label="Display name" />
        <BaseInput v-model="variantData.sku" label="SKU" />
        <BaseInput v-model="variantData.colour" label="Colour" />
        <BaseInput v-model="variantData.size" label="Size" />
        <BaseInput v-model="variantData.price" label="Selling price" prefix="₦" inputmode="decimal" />
        <BaseInput v-model="variantData.cost" label="Cost price" prefix="₦" inputmode="decimal" />
        <BaseInput v-model="variantData.threshold" label="Low-stock alert at" type="number" />
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="variantFormOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="saveVariant">Save variant</BaseButton></div>
    </BaseModal>

    <BaseModal v-model:open="addOpen" title="Add a variant" description="For a new size, colour or option.">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="newVariant.colour" label="Colour" placeholder="Black" />
        <BaseInput v-model="newVariant.size" label="Size" placeholder="XL" />
        <BaseInput v-model="newVariant.name" label="Display name" placeholder="Optional" />
        <BaseInput v-model="newVariant.sku" label="SKU" />
        <BaseInput v-model="newVariant.price" label="Selling price" prefix="₦" inputmode="decimal" />
        <BaseInput v-model="newVariant.cost" label="Cost price" prefix="₦" inputmode="decimal" />
        <BaseInput v-model="newVariant.quantity" label="Opening stock" type="number" />
        <BaseInput v-model="newVariant.threshold" label="Low-stock alert at" type="number" />
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="addOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="saveNewVariant">Add variant</BaseButton></div>
    </BaseModal>

    <ConfirmDialog v-model:open="confirmDeleteOpen" danger title="Delete this variant?" message="It will be removed from the product. You can only delete a variant when its stock is zero." confirm-label="Delete variant" @confirm="doRemoveVariant" />
  </div>
</template>
