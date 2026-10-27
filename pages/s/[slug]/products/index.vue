<script setup lang="ts">
import { Search, SlidersHorizontal } from 'lucide-vue-next';
definePageMeta({ layout: false });
const route = useRoute();
const config = useRuntimeConfig();
const router = useRouter();
const slug = computed(() => String(route.params.slug));
const search = ref(typeof route.query.search === 'string' ? route.query.search : '');
const category = ref(typeof route.query.category === 'string' ? route.query.category : '');
const page = ref(Number(route.query.page) || 1);
const query = computed(() => ({ search: search.value || undefined, category: category.value || undefined, page: page.value, limit: 24 }));
const { data, error, refresh } = await useStorefrontProducts(slug, query);
const { data: home } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
const ogImage = computed(() => business.value.bannerUrl || business.value.logoUrl || `${config.public.appUrl}/pwa-512.png`);
useSeoMeta({
  title: computed(() => `Shop — ${business.value.name}`),
  description: computed(() => `Browse ${data.value?.meta.total || 0} products from ${business.value.name}. ${business.value.tagline}`),
  ogTitle: computed(() => `Shop ${business.value.name}`),
  ogDescription: computed(() => business.value.seoDescription || business.value.tagline),
  ogImage: computed(() => ogImage.value),
  twitterCard: 'summary_large_image',
});
useHead({ titleTemplate: '%s' });
let timer: ReturnType<typeof setTimeout> | null = null;
function updateQuery() {
  const q: Record<string, string> = {};
  if (search.value) q.search = search.value;
  if (category.value) q.category = category.value;
  if (page.value > 1) q.page = String(page.value);
  router.replace({ query: q });
}
watch(search, () => { if (timer) clearTimeout(timer); timer = setTimeout(async () => { page.value = 1; updateQuery(); await refresh(); }, 300); });
watch(category, async () => { page.value = 1; updateQuery(); await refresh(); });
async function goPage(next: number) { page.value = next; updateQuery(); await refresh(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="mb-8">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">The collection</p>
        <h1 class="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl" :style="{ color: template.colors.ink }">Shop {{ business.name }}</h1>
        <p class="mt-2 text-sm" :style="{ color: template.colors.muted }">{{ data.meta.total }} product{{ data.meta.total === 1 ? '' : 's' }} available</p>
      </div>
      <div class="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-center" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" :style="{ color: template.colors.muted }" />
          <input v-model="search" type="search" placeholder="Search this store…" class="w-full rounded-full border py-3 pl-11 pr-4 text-sm outline-none" :style="{ background: template.colors.surface, borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }" aria-label="Search products">
        </div>
        <div class="scrollbar-none flex gap-1.5 overflow-x-auto">
          <button type="button" class="shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold" :style="!category ? { background: template.colors.primary, color: template.colors.onPrimary, borderColor: template.colors.primary } : { color: template.colors.ink, borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)` }" @click="category = ''">All</button>
          <button v-for="cat in home?.categories || []" :key="cat" type="button" class="shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold" :style="category === cat ? { background: template.colors.primary, color: template.colors.onPrimary, borderColor: template.colors.primary } : { color: template.colors.ink, borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)` }" @click="category = cat">{{ cat }}</button>
        </div>
      </div>
      <div v-if="data.items.length" class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StorefrontProductCard v-for="product in data.items" :key="product.id" :product="product" :template="template" :business="business" />
      </div>
      <div v-else class="py-20 text-center">
        <SlidersHorizontal class="mx-auto h-8 w-8 opacity-30" :style="{ color: template.colors.ink }" />
        <h2 class="mt-3 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">Nothing matched that</h2>
        <p class="mt-1 text-sm" :style="{ color: template.colors.muted }">Try another word or clear the category.</p>
        <button type="button" class="mt-5 rounded-full px-5 py-3 text-xs font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }" @click="search = ''; category = ''; refresh()">Show everything</button>
      </div>
      <div v-if="data.meta.pages > 1" class="mt-8 flex items-center justify-center gap-2">
        <button class="rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-30" :style="{ borderColor: template.colors.ink, color: template.colors.ink }" :disabled="data.meta.page <= 1" @click="goPage(data.meta.page - 1)">Previous</button>
        <span class="text-xs" :style="{ color: template.colors.muted }">Page {{ data.meta.page }} of {{ data.meta.pages }}</span>
        <button class="rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-30" :style="{ borderColor: template.colors.ink, color: template.colors.ink }" :disabled="data.meta.page >= data.meta.pages" @click="goPage(data.meta.page + 1)">Next</button>
      </div>
    </div>
  </StorefrontShell>
</template>
