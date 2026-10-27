<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Add a product' });
const router = useRouter();
const route = useRoute();
const toast = useToast();
const businessStore = useBusinessStore();
const products = useProducts();
const { create, saving } = useProduct();
const onboarding = computed(() => route.query.onboarding === '1');
async function submit(payload: Parameters<typeof create>[0]) {
  try {
    const product = await create(payload);
    toast.success(`${product.name} added. Your storefront just got bigger.`);
    await businessStore.refreshOnboarding();
    if (onboarding.value) await router.push('/app/sales/new?onboarding=1');
    else await router.push('/app/products');
  } catch (error) { toast.error((error as Error).message); }
}
onMounted(() => products.loadExtras());
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <div class="flex items-center gap-3">
      <NuxtLink to="/app/products" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink>
      <div><p class="eyebrow">{{ onboarding ? 'Step 2 of 3' : 'Catalog' }}</p><h1 class="font-display text-3xl font-bold tracking-tight">Add a product</h1></div>
    </div>
    <div v-if="onboarding" class="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm font-medium text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-100">Add one real product you sell. Next, you'll record a sale and see your first profit number.</div>
    <div data-tour="product-form"><ProductForm :saving="saving" mode="create" :categories="products.categories.value" @submit="submit" @cancel="router.push('/app/products')" /></div>
  </div>
</template>
