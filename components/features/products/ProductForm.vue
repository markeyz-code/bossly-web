<script setup lang="ts">
import { Plus, Sparkles, Trash2 } from 'lucide-vue-next';
import { nairaInput, nairaToKobo, formatNaira } from '~/utils/money';
import type { Product } from '~/types';
import type { ProductPayload } from '~/api/types';

const props = withDefaults(defineProps<{ product?: Product | null; saving?: boolean; mode?: 'create' | 'edit'; categories?: string[] }>(), { saving: false, mode: 'create' });
const emit = defineEmits<{ submit: [ProductPayload]; cancel: [] }>();
const toast = useToast();
const name = ref(props.product?.name || '');
const description = ref(props.product?.description || '');
const category = ref(props.product?.category || '');
const sku = ref(props.product?.sku || '');
const images = ref<string[]>(props.product?.images || []);
const tags = ref<string>((props.product?.tags || []).join(', '));
const threshold = ref(props.product?.lowStockThreshold ?? 3);
const hasVariants = ref(Boolean(props.product?.variants?.length && props.product.variants.length > 1));
const basePrice = ref(nairaInput(props.product?.priceKobo));
const baseCost = ref(nairaInput(props.product?.costPriceKobo));
const baseQuantity = ref(String(props.product?.quantity ?? 0));
const variantRows = ref<Array<{ name: string; sku: string; price: string; cost: string; quantity: string; threshold: string; colour: string; size: string }>>([]);
const errors = reactive<Record<string, string>>({});
const isEdit = computed(() => props.mode === 'edit');

const suggestedCategories = computed(() => {
  const base = ['Hoodies', 'Tees', 'Caps', 'Dresses', 'Shoes', 'Bags', 'Skincare', 'Food', 'Drinks', 'Accessories', 'Books', 'Services'];
  return [...new Set([...(props.categories || []), ...base])];
});
const margin = computed(() => {
  const p = nairaToKobo(basePrice.value); const c = nairaToKobo(baseCost.value);
  if (!p) return 0;
  return Math.round(((p - c) / p) * 100);
});
function addVariant() {
  variantRows.value.push({ name: '', sku: '', price: basePrice.value || '', cost: baseCost.value || '', quantity: '0', threshold: String(threshold.value), colour: '', size: '' });
}
function addQuickVariant(colour?: string, size?: string) {
  if (!variantRows.value.length) addVariant();
  const price = basePrice.value;
  const cost = baseCost.value;
  variantRows.value.push({ name: [colour, size].filter(Boolean).join(' / '), sku: '', price, cost, quantity: '0', threshold: String(threshold.value), colour: colour || '', size: size || '' });
}
function variantName(row: typeof variantRows.value[number]) {
  return row.name || [row.colour, row.size].filter(Boolean).join(' / ') || 'Option';
}
function submit() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (name.value.trim().length < 2) errors.name = 'Give the product a name.';
  if (!category.value.trim()) errors.category = 'Pick a category.';
  const payload: ProductPayload = {
    name: name.value.trim(),
    description: description.value.trim(),
    category: category.value.trim(),
    sku: sku.value.trim() || undefined,
    images: images.value,
    tags: tags.value.split(',').map((t) => t.trim()).filter(Boolean),
    lowStockThreshold: Number(threshold.value) || 0,
  };
  if (hasVariants.value) {
    if (!variantRows.value.length) { errors.variants = 'Add at least one variant.'; }
    const variants = variantRows.value.map((row) => ({
      name: variantName(row), sku: row.sku || undefined,
      attributes: Object.fromEntries(Object.entries({ colour: row.colour, size: row.size }).filter(([, v]) => v)),
      priceKobo: nairaToKobo(row.price), costPriceKobo: nairaToKobo(row.cost), quantity: Number(row.quantity) || 0,
      lowStockThreshold: Number(row.threshold) || 0,
    }));
    variants.forEach((v, index) => {
      if (!v.priceKobo) errors[`variant-${index}`] = 'Every variant needs a selling price.';
    });
    payload.variants = variants;
  } else {
    if (!nairaToKobo(basePrice.value)) errors.price = 'Add a selling price.';
    payload.priceKobo = nairaToKobo(basePrice.value);
    payload.costPriceKobo = nairaToKobo(baseCost.value);
    payload.quantity = Number(baseQuantity.value) || 0;
  }
  if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
  emit('submit', payload);
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <BaseCard>
      <h2 class="font-display text-xl font-bold">The basics</h2>
      <p class="mt-1 text-xs text-muted">Customers see this on your storefront.</p>
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2"><BaseInput v-model="name" label="Product name" placeholder="e.g. Oversized campus hoodie" :error="errors.name" required /></div>
        <div class="sm:col-span-2"><BaseTextarea v-model="description" label="Description" placeholder="What is it, what makes it good, how does it fit?" hint="Short and clear beats long and clever." /></div>
        <div>
          <BaseInput v-model="category" label="Category" placeholder="Hoodies" :error="errors.category" required hint="Type a new one or pick a suggestion." />
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="cat in suggestedCategories.slice(0, 7)" :key="cat" type="button" class="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold text-muted hover:border-ink hover:text-ink" @click="category = cat">{{ cat }}</button>
          </div>
        </div>
        <BaseInput v-model="sku" label="SKU" placeholder="HOOD-BLK" hint="Optional. Useful for your records." />
        <div class="sm:col-span-2"><BaseInput v-model="tags" label="Hidden search tags" placeholder="hoodie, streetwear, unisex" hint="Comma-separated. Helps customers find it." /></div>
      </div>
      <div class="mt-5"><ImageUploader v-model="images" purpose="products" label="Product photos" hint="First photo is the cover. Up to 5." multiple :max="5" aspect="square" /></div>
    </BaseCard>

    <BaseCard>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div><h2 class="font-display text-xl font-bold">Price & stock</h2><p class="mt-1 text-xs text-muted">This is how Bossly calculates profit.</p></div>
        <BaseBadge v-if="!isEdit && basePrice" :variant="margin >= 20 ? 'success' : 'warning'">Margin {{ margin }}%</BaseBadge>
      </div>
      <div v-if="!hasVariants || isEdit" class="mt-5 grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="basePrice" label="Selling price" prefix="₦" inputmode="decimal" placeholder="12,500" :error="errors.price" required />
        <BaseInput v-model="baseCost" label="Cost price" prefix="₦" inputmode="decimal" placeholder="7,200" hint="What it costs you per unit, including transport." />
        <BaseInput v-if="!isEdit" v-model="baseQuantity" label="Quantity in stock" type="number" inputmode="numeric" placeholder="10" />
        <BaseInput v-model="threshold" label="Low-stock alert at" type="number" inputmode="numeric" hint="We'll alert you when stock hits this number." />
      </div>
      <div v-if="isEdit" class="mt-3 rounded-2xl bg-raised/60 p-4 text-xs text-muted">
        Changing price applies to all variants. Use the variants section on this page to edit a specific variant or add stock.
      </div>
      <div v-if="!isEdit" class="mt-5 border-t border-line pt-4">
        <BaseCheckbox v-model="hasVariants" label="This product has variants" description="Sizes, colours or any option with its own stock and price." />
      </div>
      <div v-if="!isEdit && hasVariants" class="mt-5 space-y-3">
        <div class="flex items-center justify-between"><p class="text-sm font-bold">Variants</p><button type="button" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-300" @click="addVariant"><Plus class="h-3.5 w-3.5" /> Add variant</button></div>
        <div class="flex flex-wrap gap-1.5">
          <button type="button" class="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold hover:border-ink" @click="addQuickVariant('Black', 'M')">+ Black / M</button>
          <button type="button" class="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold hover:border-ink" @click="addQuickVariant('Black', 'L')">+ Black / L</button>
          <button type="button" class="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold hover:border-ink" @click="addQuickVariant('Cream', 'M')">+ Cream / M</button>
        </div>
        <div v-if="errors.variants" class="rounded-xl bg-danger/5 p-3 text-xs font-medium text-danger">{{ errors.variants }}</div>
        <div v-for="(row, index) in variantRows" :key="index" class="rounded-2xl border border-line bg-raised/40 p-4">
          <div class="mb-3 flex items-center justify-between"><p class="text-xs font-bold">Variant {{ index + 1 }} · {{ variantName(row) }}</p><button type="button" class="text-danger" aria-label="Remove variant" @click="variantRows.splice(index, 1)"><Trash2 class="h-4 w-4" /></button></div>
          <div class="grid gap-3 sm:grid-cols-4">
            <BaseInput v-model="row.colour" label="Colour" placeholder="Black" />
            <BaseInput v-model="row.size" label="Size" placeholder="M" />
            <BaseInput v-model="row.price" label="Price" prefix="₦" inputmode="decimal" />
            <BaseInput v-model="row.quantity" label="Stock" type="number" />
            <BaseInput v-model="row.cost" label="Cost" prefix="₦" inputmode="decimal" />
            <BaseInput v-model="row.threshold" label="Alert at" type="number" />
            <BaseInput v-model="row.sku" label="SKU" placeholder="HOOD-BLK-M" />
            <BaseInput v-model="row.name" label="Display name" placeholder="Optional" />
          </div>
          <p v-if="errors[`variant-${index}`]" class="mt-2 text-xs font-medium text-danger">{{ errors[`variant-${index}`] }}</p>
        </div>
      </div>
    </BaseCard>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <BaseButton variant="ghost" type="button" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton type="submit" :loading="saving" size="lg">{{ isEdit ? 'Save changes' : 'Add product' }} <Sparkles class="h-4 w-4" /></BaseButton>
    </div>
  </form>
</template>
