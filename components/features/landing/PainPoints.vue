<script setup lang="ts">
import { BatteryLow, MessageSquareDashed, PackageX, ReceiptText, Wallet } from 'lucide-vue-next';
const pains = [
  { icon: MessageSquareDashed, title: 'Sales live in your chats', body: 'WhatsApp, Instagram, voice notes. When you need the real number, it is scattered across five apps and your memory.', label: '01' },
  { icon: PackageX, title: 'Stock has a mind of its own', body: 'You think you have three hoodies. A customer asks for two. You have one. Somebody leaves disappointed.', label: '02' },
  { icon: Wallet, title: '“I’ll pay you tomorrow”', body: 'No record of who owes, how much or when. Money disappears politely — and you fund your business from your pocket.', label: '03' },
];
</script>

<template>
  <section class="border-b border-line py-16 sm:py-24">
    <div class="shell">
      <div class="mx-auto max-w-3xl text-center">
        <p class="eyebrow">The real problem</p>
        <h2 class="mt-3 text-balance font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">You’re not bad at business.<br><span class="text-brand-500">Your records are.</span></h2>
        <p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">Student businesses don’t fail because the products are bad. They fail because the numbers live in your head, your chat and a notebook you left in class.</p>
      </div>
      <div class="mt-12 grid gap-4 md:grid-cols-3">
        <div v-for="(pain, index) in pains" :key="pain.title" class="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-lift" :class="index === 1 ? 'md:translate-y-5' : ''">
          <div class="flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-raised text-ink"><component :is="pain.icon" class="h-6 w-6" /></div>
            <span class="font-display text-3xl font-bold text-line">{{ pain.label }}</span>
          </div>
          <h3 class="mt-5 font-display text-xl font-bold tracking-tight">{{ pain.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ pain.body }}</p>
        </div>
      </div>
      <div class="mt-12 flex items-center justify-center gap-3 rounded-3xl border border-ink bg-accent px-5 py-4 text-center text-sm font-bold text-forest-900 sm:mt-16 sm:text-base">
        <BatteryLow class="h-5 w-5 shrink-0" />
        <p>One place for sales, stock, debts and profit. That’s Bossly.</p>
        <ReceiptText class="hidden h-5 w-5 sm:block" />
      </div>
    </div>
  </section>
</template>
