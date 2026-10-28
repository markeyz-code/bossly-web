<script setup lang="ts">
import { ArrowUpRight, Check } from 'lucide-vue-next';

const questions = [
  {
    label: 'The profit question',
    question: 'Did I actually make a profit — or did I just move money?',
    answer: 'Ojaly subtracts the real cost of what you sold and the expenses you actually paid. You see net profit, margin and the one or two things quietly eating your money.',
    outcome: 'Know your true margin',
    image: '/images/business/market-trader.webp',
    alt: 'A Nigerian market trader at her stall',
  },
  {
    label: 'The debt question',
    question: 'Who owes me, how much, and how do I ask without sounding desperate?',
    answer: 'Every balance has a customer, a due date and a reminder. Send a WhatsApp nudge or a Paystack link from the same screen — polite, recorded, done.',
    outcome: 'Get paid without the chase',
    image: '/images/business/barber.webp',
    alt: 'A Nigerian barber serving a customer in his shop',
  },
  {
    label: 'The website question',
    question: 'Where do customers find me when they’re not already in my DMs?',
    answer: 'Your catalogue becomes a fast storefront with search, cart, checkout, Paystack and a custom domain. Publish it in one tap and look open for business 24/7.',
    outcome: 'Look open around the clock',
    image: '/images/business/fashion-warehouse.webp',
    alt: 'A Black woman entrepreneur in a clothing store',
  },
  {
    label: 'The service question',
    question: 'I sell services, not products. Will Ojaly even work for me?',
    answer: 'Yes. Record jobs, deposits, expenses, customer balances and payment links without forcing everything into a product catalogue. Stock is optional.',
    outcome: 'Built for products and services',
    image: '/images/business/food-founder.webp',
    alt: 'A Black woman food entrepreneur working on her laptop',
  },
];

const businessTypes = ['Thrift & fashion', 'Food & catering', 'Salons & barbers', 'Design & print', 'Gadgets & repairs', 'Online stores', 'Home services', 'Cafés & bakeries'];
</script>

<template>
  <section id="questions" class="border-b border-line bg-canvas py-16 sm:py-24">
    <div class="shell">
      <div class="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div>
          <p class="eyebrow">The honest questions</p>
          <h2 class="mt-3 max-w-xl font-display text-4xl font-bold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Every owner has a 2am question.
            <span class="text-brand-500">Ojaly answers it before breakfast.</span>
          </h2>
        </div>
        <div class="lg:pb-1">
          <p class="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            You don’t have to be a student. You don’t have to sell products. You don’t even need to call yourself a founder yet. If money moves through your business, Ojaly gives you the records, the receipts and the confidence to make the next decision.
          </p>
          <a href="#features" class="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">See how Ojaly fixes it <ArrowUpRight class="h-4 w-4" /></a>
        </div>
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="(item, index) in questions" :key="item.label" class="group overflow-hidden rounded-[1.7rem] border border-line bg-surface shadow-soft transition hover:-translate-y-1 hover:border-ink">
          <div class="relative aspect-[4/3] overflow-hidden bg-forest-900">
            <img :src="item.image" :alt="item.alt" loading="lazy" class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" :style="{ objectPosition: index === 2 ? 'center 25%' : index === 1 ? 'center 30%' : 'center center' }">
            <div class="absolute inset-0 bg-gradient-to-t from-forest-900/75 via-transparent to-transparent" />
            <span class="absolute left-3 top-3 rounded-full border border-white/20 bg-forest-900/70 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">0{{ index + 1 }} · {{ item.label }}</span>
            <p class="absolute bottom-3 left-3 right-3 font-display text-[15px] font-bold leading-snug text-white">“{{ item.question }}”</p>
          </div>
          <div class="p-4 sm:p-5">
            <p class="text-[12px] leading-relaxed text-muted">{{ item.answer }}</p>
            <p class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[9px] font-bold text-success"><Check class="h-3 w-3" /> {{ item.outcome }}</p>
          </div>
        </article>
      </div>

      <div class="mt-8 flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">Made for the businesses people actually run</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="type in businessTypes" :key="type" class="rounded-full border border-line bg-canvas px-3 py-1.5 text-[10px] font-semibold text-ink">{{ type }}</span>
          </div>
        </div>
        <BaseButton to="/register" class="shrink-0">Start free</BaseButton>
      </div>
    </div>
  </section>
</template>
