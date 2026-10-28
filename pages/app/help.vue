<script setup lang="ts">
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Clock, Compass, Mail, MessageCircle, Play, Search, Sparkles } from 'lucide-vue-next';
import { HELP_ARTICLES, HELP_CATEGORIES } from '~/utils/help';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Help center', robots: 'noindex,nofollow' });
const route = useRoute();
const toast = useToast();
const { tours, completed, start, hydrateProgress } = useTour();
const query = ref('');
const category = ref('all');
const expanded = ref<string | null>('first-sale');
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return HELP_ARTICLES.filter((article) => {
    const inCategory = category.value === 'all' || article.category === category.value;
    const haystack = `${article.title} ${article.summary} ${article.body.join(' ')}`.toLowerCase();
    return inCategory && (!q || haystack.includes(q));
  });
});
const grouped = computed(() => HELP_CATEGORIES.map((cat) => ({
  ...cat,
  articles: filtered.value.filter((article) => article.category === cat.key),
})).filter((group) => group.articles.length));
async function playTour(id: string) {
  await start(id);
  toast.info('Follow the spotlight. Press Esc any time to stop.');
}
onMounted(async () => {
  hydrateProgress();
  const tour = typeof route.query.tour === 'string' ? route.query.tour : '';
  if (tour && tours.some((item) => item.id === tour)) await playTour(tour);
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Help center" subtitle="Short answers, real workflows and guided tours for the way you actually sell." eyebrow="Support">
      <template #actions><BaseButton :href="'mailto:support@ojaly.ng?subject=Ojaly%20support'" variant="outline"><Mail class="h-4 w-4" /> Email support</BaseButton></template>
    </PageHeader>

    <section class="relative overflow-hidden rounded-3xl bg-forest-900 p-6 text-white sm:p-8">
      <div class="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
      <div class="relative max-w-2xl">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300"><Compass class="h-3 w-3" /> Learn by doing</span>
        <h2 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">A five-minute tour beats a fifty-page manual.</h2>
        <p class="mt-2 text-sm leading-relaxed text-white/70">Pick a tour. Ojaly highlights the exact buttons, walks you through the flow and gets out of the way.</p>
        <div class="relative mt-5 max-w-lg">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input v-model="query" type="search" placeholder="Search help: debt, stock, website, WhatsApp…" class="min-h-[48px] w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30">
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-end justify-between gap-3"><div><p class="eyebrow">Guided tours</p><h2 class="mt-1 font-display text-2xl font-bold">Pick your path</h2></div><span class="text-[11px] text-muted">{{ completed.length }}/{{ tours.length }} completed</span></div>
      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <article v-for="tour in tours" :key="tour.id" class="card group flex flex-col overflow-hidden p-0">
          <div class="relative h-24 overflow-hidden p-4" :style="{ background: tour.color }">
            <div class="absolute -right-4 -top-6 h-24 w-24 rounded-full bg-white/15" /><div class="absolute -bottom-8 right-12 h-20 w-20 rounded-full bg-black/10" />
            <div class="relative flex items-center justify-between"><span class="rounded-full bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{{ tour.duration }}</span><CheckCircle2 v-if="completed.includes(tour.id)" class="h-5 w-5 text-white" /><Sparkles v-else class="h-5 w-5 text-white/70" /></div>
            <p class="relative mt-4 font-display text-xl font-bold text-white">{{ tour.title }}</p>
          </div>
          <div class="flex flex-1 flex-col p-4">
            <p class="text-xs leading-relaxed text-muted">{{ tour.description }}</p>
            <div class="mt-3 flex items-center gap-1.5 text-[10px] text-muted"><Clock class="h-3 w-3" /> {{ tour.steps.length }} steps</div>
            <BaseButton class="mt-4" size="sm" :variant="completed.includes(tour.id) ? 'outline' : 'primary'" @click="playTour(tour.id)"><Play class="h-3.5 w-3.5" /> {{ completed.includes(tour.id) ? 'Replay tour' : 'Start tour' }}</BaseButton>
          </div>
        </article>
      </div>
    </section>

    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Help categories">
      <button type="button" role="tab" :aria-selected="category === 'all'" class="shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold transition" :class="category === 'all' ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted hover:text-ink'" @click="category = 'all'">All topics</button>
      <button v-for="cat in HELP_CATEGORIES" :key="cat.key" type="button" role="tab" :aria-selected="category === cat.key" class="shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold transition" :class="category === cat.key ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted hover:text-ink'" @click="category = cat.key">{{ cat.label }}</button>
    </div>

    <div v-if="grouped.length" class="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-5">
        <section v-for="group in grouped" :key="group.key">
          <div class="mb-2 flex items-end justify-between"><div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">{{ group.label }}</p><p class="text-[11px] text-muted">{{ group.description }}</p></div></div>
          <div class="space-y-2">
            <article v-for="article in group.articles" :key="article.id" class="card overflow-hidden">
              <button type="button" class="flex w-full items-start gap-3 p-4 text-left" :aria-expanded="expanded === article.id" @click="expanded = expanded === article.id ? null : article.id">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><BookOpen class="h-4 w-4" /></span>
                <span class="min-w-0 flex-1"><span class="block text-sm font-bold">{{ article.title }}</span><span class="mt-0.5 block text-[11px] leading-relaxed text-muted">{{ article.summary }}</span></span>
                <ChevronDown class="mt-1 h-4 w-4 shrink-0 text-muted transition" :class="expanded === article.id ? 'rotate-180' : ''" />
              </button>
              <div v-if="expanded === article.id" class="border-t border-line px-4 py-4 pl-[60px]">
                <p v-for="(paragraph, index) in article.body" :key="index" class="mb-2 text-[12px] leading-relaxed text-muted last:mb-0">{{ paragraph }}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
      <aside class="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
        <BaseCard>
          <h3 class="font-display text-lg font-bold">Still stuck?</h3>
          <p class="mt-1 text-xs leading-relaxed text-muted">Tell us what you were trying to do and what happened. Include a screenshot if you can — never send your password or full card details.</p>
          <div class="mt-3 grid gap-2">
            <BaseButton href="mailto:support@ojaly.ng?subject=Ojaly%20support" block><Mail class="h-4 w-4" /> support@ojaly.ng</BaseButton>
            <BaseButton to="/app/notifications" variant="outline" block><MessageCircle class="h-4 w-4" /> Check notifications</BaseButton>
          </div>
          <p class="mt-3 text-[10px] text-muted">We usually reply within one business day. For payment issues, include the Paystack reference.</p>
        </BaseCard>
        <BaseCard class="bg-accent/40 dark:bg-accent/10">
          <div class="flex items-center gap-2"><Compass class="h-4 w-4" /><h3 class="font-display text-base font-bold">Keyboard shortcuts</h3></div>
          <div class="mt-3 space-y-1.5 text-[11px] text-muted"><p><kbd class="rounded border border-line bg-surface px-1.5 py-0.5">Esc</kbd> stop a tour</p><p><kbd class="rounded border border-line bg-surface px-1.5 py-0.5">←</kbd> <kbd class="rounded border border-line bg-surface px-1.5 py-0.5">→</kbd> move between tour steps</p></div>
          <NuxtLink to="/app/affiliates" class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-300">Earn by referring a friend <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
        </BaseCard>
      </aside>
    </div>
    <BaseEmptyState v-else title="Nothing matched that search" message="Try “stock”, “debt”, “website” or “WhatsApp”.">
      <template #icon><Search class="h-6 w-6" /></template>
      <BaseButton size="sm" class="mt-3" @click="query = ''; category = 'all'">Clear search</BaseButton>
    </BaseEmptyState>
  </div>
</template>
