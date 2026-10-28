<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, ChevronRight, Pause, PlayCircle } from 'lucide-vue-next';

const auth = useAuthStore();

type Slide = {
  label: string;
  titleTop: string;
  titleBottom: string;
  sub: string;
  question: string;
  headline: string;
  answer: string;
  outcome: string;
  image: string;
  alt: string;
  position: string;
};

const slides: Slide[] = [
  {
    label: 'The 11pm question · Profit',
    titleTop: 'Run the business.',
    titleBottom: 'Know the money.',
    sub: 'Sales, stock, debts, WhatsApp orders and a free storefront — one calm system that tells you the truth, even when business is messy.',
    question: '“I made sales. So why is there no money left?”',
    headline: 'Revenue is loud. Profit is the truth.',
    answer: 'Ojaly adds up every sale, cost of goods and real expense — then shows the one number that tells you whether the business is actually working.',
    outcome: 'See your true profit, in plain language',
    image: '/images/business/market-trader.webp',
    alt: 'A Nigerian market trader holding fresh produce at his stall',
    position: 'center 42%',
  },
  {
    label: 'The 11pm question · Debts',
    titleTop: 'Stop chasing.',
    titleBottom: 'Start collecting.',
    sub: 'Know who owes what, when it is due and how to ask politely. Send a reminder or a payment link without breaking the relationship.',
    question: '“Who still owes me — and how do I ask again?”',
    headline: 'Stop chasing from memory.',
    answer: 'Every debt gets a customer, a balance and a due date. Send a polite WhatsApp reminder or a Paystack link without the awkward conversation.',
    outcome: 'Get paid without the awkward chase',
    image: '/images/business/barber.webp',
    alt: 'A Nigerian barber at work in his shop',
    position: 'center 35%',
  },
  {
    label: 'The 11pm question · Website',
    titleTop: 'Your catalogue.',
    titleBottom: 'Your website.',
    sub: 'Add what you sell once. Publish a fast storefront with cart, checkout and Paystack. No developer, no monthly website bill.',
    question: '“I need a real website, but I can’t afford a developer.”',
    headline: 'Your catalogue is the website.',
    answer: 'Add what you sell once. Pick a template, set your colours and publish a fast storefront with cart, checkout and Paystack. No designer. No developer bill.',
    outcome: 'A storefront that opens while you sleep',
    image: '/images/business/website-founder.webp',
    alt: 'A Black woman entrepreneur working on a laptop in her office',
    position: 'center 36%',
  },
  {
    label: 'The 11pm question · WhatsApp',
    titleTop: 'Paste the chat.',
    titleBottom: 'Keep the customer.',
    sub: 'Ojaly reads the conversation, drafts the order and updates stock, sales and receipts. You confirm; it keeps the record.',
    question: '“My orders are buried in WhatsApp. I’m scared to lose one.”',
    headline: 'Paste the chat. Keep the customer.',
    answer: 'Ojaly reads the order conversation, drafts the sale and updates stock, debts and receipts. You confirm the details; Ojaly keeps the record.',
    outcome: 'From chat to receipt in seconds',
    image: '/images/business/food-founder.webp',
    alt: 'A Black woman food entrepreneur working on her laptop',
    position: 'center 45%',
  },
  {
    label: 'The 11pm question · Services',
    titleTop: 'Sell anything.',
    titleBottom: 'Run one system.',
    sub: 'Thrift, food, salons, printing, repairs or services — record the money, the customer and the next step in one place.',
    question: '“I sell services, not products. Will this even work for me?”',
    headline: 'If money moves, Ojaly works.',
    answer: 'Salons, barbers, caterers, printers and designers can record jobs, deposits, expenses and customer balances without forcing everything into a product catalogue.',
    outcome: 'One system for products and services',
    image: '/images/business/baker.webp',
    alt: 'A Nigerian baker preparing and packing food orders',
    position: 'center 38%',
  },
];

const index = ref(0);
const userPaused = ref(false);
const hovering = ref(false);
const reducedMotion = ref(false);
const slide = computed(() => slides[index.value]);
const isPaused = computed(() => userPaused.value || hovering.value);

function go(delta: number) {
  index.value = (index.value + delta + slides.length) % slides.length;
}

function goTo(next: number) {
  index.value = next;
}

function pause() { hovering.value = true; }
function resume() { hovering.value = false; }

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
}

let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  timer = setInterval(() => {
    if (!isPaused.value && !document.hidden) go(1);
  }, 6500);
});
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>

<template>
  <section class="relative overflow-hidden border-b border-line" aria-label="Why businesses choose Ojaly">
    <div class="absolute inset-0 grid-paper opacity-[0.35]" />
    <div class="absolute -right-24 top-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />

    <div class="shell relative grid gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-20">
      <div class="max-w-2xl">
        <div class="mb-6 inline-flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-accent px-3 py-1.5 text-[11px] font-bold text-forest-900">
            <span class="h-1.5 w-1.5 rounded-full bg-forest-900" /> Built for ambitious Nigerian businesses
          </span>
          <span class="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted">Not just students · Not just boutiques</span>
        </div>

        <div :key="index" class="hero-copy">
          <h1 class="font-display text-[clamp(2.7rem,5.5vw,5.2rem)] font-bold leading-[0.92] tracking-[-0.065em]">
            {{ slide.titleTop }}<br>
            <span class="relative inline-block">
              <span class="relative z-10">{{ slide.titleBottom }}</span>
              <span class="absolute bottom-1 left-0 z-0 h-[24%] w-full -rotate-1 bg-brand-500/80" />
            </span>
          </h1>
          <p class="mt-4 max-w-lg text-balance text-base leading-relaxed text-muted sm:text-lg">{{ slide.sub }}</p>
        </div>

        <div class="mt-7 flex flex-wrap gap-2 text-[11px] font-semibold text-muted" aria-label="Who Ojaly is for">
          <span v-for="type in ['Thrift & fashion', 'Food & catering', 'Salons & barbers', 'Design & print', 'Gadgets & repairs', 'Online stores']" :key="type" class="rounded-full border border-line bg-surface px-3 py-1.5">{{ type }}</span>
        </div>

        <div
          class="mt-8 rounded-[1.6rem] border border-line bg-surface p-5 shadow-soft sm:p-6"
          tabindex="0"
          role="group"
          aria-roledescription="carousel"
          aria-label="Common business questions"
          @mouseenter="hovering = true"
          @mouseleave="hovering = false"
          @keydown="onKeydown"
        >
          <div class="flex items-start justify-between gap-4">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">{{ slide.label }}</p>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:bg-raised hover:text-ink" :aria-label="userPaused ? 'Resume carousel' : 'Pause carousel'" @click="userPaused = !userPaused">
              <PlayCircle v-if="userPaused" class="h-4 w-4" />
              <Pause v-else class="h-4 w-4" />
            </button>
          </div>

          <div class="mt-3 min-h-[132px]" aria-live="polite">
            <div :key="index" class="hero-copy">
              <p class="font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">{{ slide.question }}</p>
              <p class="mt-2 text-[13px] leading-relaxed text-muted">{{ slide.answer }}</p>
              <p class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-bold text-success"><Check class="h-3 w-3" /> {{ slide.outcome }}</p>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
            <div class="flex items-center gap-1.5" role="tablist" aria-label="Choose a question">
              <button
                v-for="(s, i) in slides"
                :key="s.label"
                type="button"
                role="tab"
                :aria-selected="index === i"
                :aria-label="`Show question ${i + 1}: ${s.label}`"
                class="h-2.5 rounded-full transition-all"
                :class="index === i ? 'w-7 bg-brand-500' : 'w-2.5 bg-line hover:bg-muted/50'"
                @click="goTo(i)"
              />
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition hover:bg-raised hover:text-ink" aria-label="Previous question" @click="go(-1)"><ArrowLeft class="h-4 w-4" /></button>
              <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition hover:bg-raised hover:text-ink" aria-label="Next question" @click="go(1)"><ArrowRight class="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <BaseButton :to="auth.isAuthenticated ? '/app' : '/register'" size="lg" class="group">
            {{ auth.isAuthenticated ? 'Open my dashboard' : 'Start free — no card' }}
            <ArrowRight class="h-5 w-5 transition group-hover:translate-x-1" />
          </BaseButton>
          <BaseButton href="#how" size="lg" variant="outline">See how it works <ChevronRight class="h-5 w-5" /></BaseButton>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted">
          <span class="inline-flex items-center gap-1.5"><Check class="h-4 w-4 text-success" /> Set up in under 5 minutes</span>
          <span class="inline-flex items-center gap-1.5"><Check class="h-4 w-4 text-success" /> Works on WhatsApp</span>
          <span class="inline-flex items-center gap-1.5"><Check class="h-4 w-4 text-success" /> Naira from day one</span>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-[560px]">
        <div class="absolute -left-5 top-16 hidden h-24 w-24 -rotate-6 rounded-[2rem] border-2 border-ink bg-accent sm:block" />
        <div class="absolute -right-4 bottom-12 hidden h-16 w-16 rotate-12 rounded-2xl bg-brand-500 sm:block" />
        <div class="relative rotate-[1.2deg] overflow-hidden rounded-[2rem] border-2 border-ink bg-forest-900 shadow-[10px_12px_0_0_#06231A]">
          <div class="relative aspect-[4/5] overflow-hidden bg-forest-900 sm:aspect-[5/6]">
            <img
              :key="slide.image"
              :src="slide.image"
              :alt="slide.alt"
              :style="{ objectPosition: slide.position }"
              class="hero-photo h-full w-full object-cover"
              :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
            >
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/20 to-transparent" />
            <div class="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
              <span class="rounded-full border border-white/20 bg-forest-900/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">Real business · Real numbers</span>
              <span class="rounded-full bg-brand-500 px-2.5 py-1.5 text-[9px] font-bold text-white">OJALY</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <div class="rounded-2xl border border-white/15 bg-white/95 p-4 shadow-lift backdrop-blur">
                <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-600">The Ojaly answer</p>
                <p class="mt-1 font-display text-lg font-bold leading-tight tracking-[-0.02em] text-forest-900 sm:text-xl">{{ slide.headline }}</p>
                <p class="mt-1.5 text-[11px] font-semibold text-forest-700/70">{{ slide.outcome }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2 bg-forest-900 px-4 py-3 text-[10px] font-semibold text-[#A8C0B4]">
            <span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-success" /> Live storefront included</span>
            <span>{{ String(index + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-line bg-forest-900 py-3 text-white">
      <div class="overflow-hidden whitespace-nowrap">
        <div class="animate-marquee inline-flex gap-8 text-xs font-bold uppercase tracking-[0.16em] text-[#A8C0B4]">
          <span v-for="i in 2" :key="i" class="inline-flex gap-8">
            <span>Real profit</span><span class="text-brand-400">✦</span><span>Stock you can trust</span><span class="text-accent">✦</span><span>Debts tracked</span><span class="text-brand-400">✦</span><span>Free storefront</span><span class="text-accent">✦</span><span>WhatsApp orders</span><span class="text-brand-400">✦</span><span>Built for Nigeria</span><span class="text-accent">✦</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-copy { animation: hero-copy-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
.hero-photo { animation: hero-photo-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes hero-copy-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes hero-photo-in { from { opacity: 0; transform: scale(1.025); } to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .hero-copy, .hero-photo { animation: none; }
}
</style>
