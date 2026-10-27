<script setup lang="ts">
import { ArrowDown, CircleDollarSign, PackagePlus, Rocket } from 'lucide-vue-next';
const steps = [
  { icon: Rocket, number: '01', title: 'Set up in minutes', body: 'Create your account, name your business, pick a vibe. That’s your back office and storefront ready.', detail: 'Name + category + logo. Done.' },
  { icon: PackagePlus, number: '02', title: 'Add what you sell', body: 'Add products, variants and prices once. The same catalog powers your stock, sales, receipts and website.', detail: 'Variants, SKU, cost and selling price.' },
  { icon: CircleDollarSign, number: '03', title: 'See the truth', body: 'Record a sale. Bossly calculates profit, updates stock, tracks debts and publishes your website automatically.', detail: 'Profit: the number you came for.' },
];
</script>

<template>
  <section id="how" class="border-b border-line bg-surface py-16 sm:py-24">
    <div class="shell">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow">How it works</p>
          <h2 class="mt-3 max-w-xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">From chaos to clarity in three moves.</h2>
        </div>
        <p class="max-w-sm text-sm leading-relaxed text-muted">No accounting degree. No developer. You already know how to use WhatsApp — you can use Bossly.</p>
      </div>
      <div class="relative mt-12 grid gap-5 lg:grid-cols-3">
        <div class="absolute left-[16.6%] right-[16.6%] top-12 hidden border-t-2 border-dashed border-line lg:block" />
        <div v-for="(step, index) in steps" :key="step.number" class="relative rounded-3xl border border-line bg-canvas p-6">
          <div class="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand-500 text-white shadow-chunky-sm">
            <component :is="step.icon" class="h-6 w-6" />
          </div>
          <span class="mt-5 block font-display text-5xl font-bold text-line">{{ step.number }}</span>
          <h3 class="mt-2 font-display text-2xl font-bold tracking-tight">{{ step.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ step.body }}</p>
          <p class="mt-5 inline-flex rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-muted">{{ step.detail }}</p>
          <ArrowDown v-if="index < steps.length - 1" class="absolute -bottom-4 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border border-line bg-surface p-1 text-brand-500 lg:hidden" />
        </div>
      </div>
      <div class="mt-9 flex justify-center">
        <BaseButton to="/register" size="lg">Start my business <span aria-hidden="true">→</span></BaseButton>
      </div>
    </div>
  </section>
</template>
