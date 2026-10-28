<script setup lang="ts">
import { ArrowUpRight, BarChart3, Boxes, Globe2, MessageCircle, Receipt, Wallet } from 'lucide-vue-next';
const wide = { icon: Globe2, title: 'A free website, from the work you already did', body: 'Your catalog becomes a real storefront with search, categories, cart and checkout. Pick a template, set your colour, publish. Your customers get a fast site; you get orders without retyping.', link: '#templates', linkLabel: 'See the templates' };
const features = [
  { icon: BarChart3, title: 'Real profit, not guesses', body: 'Revenue minus cost of goods minus expenses. Today, this week, this month. Plain language, big numbers.' },
  { icon: Boxes, title: 'Stock that counts itself', body: 'Every sale moves the ledger. Get alerts in-app, by email and on WhatsApp before you run out.' },
  { icon: Wallet, title: 'Debts with a memory', body: 'Know who owes, how much and when. Send a WhatsApp reminder or a payment link in one tap.' },
  { icon: MessageCircle, title: 'WhatsApp orders, handled', body: 'Paste a customer chat and Ojaly drafts the order. Or text the bot: “sold 2 shirts 5000”.' },
  { icon: Receipt, title: 'Receipts that look like you', body: 'Branded PDF receipts and invoices, sequential numbers, shareable links. Every business looks serious.' },
];
</script>

<template>
  <section id="features" class="border-b border-line py-16 sm:py-24">
    <div class="shell">
      <div class="max-w-2xl">
        <p class="eyebrow">Everything in one place</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">The back office your hustle deserves.</h2>
        <p class="mt-4 text-sm leading-relaxed text-muted sm:text-base">Built around the way Nigerian students actually sell: fast, mobile-first, on WhatsApp, with cash and transfers.</p>
      </div>
      <div class="mt-10 grid gap-4 lg:grid-cols-3">
        <div class="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-forest-900 p-7 text-white lg:col-span-2 lg:row-span-2">
          <div class="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-500/30 blur-2xl" />
          <div class="absolute bottom-6 right-6 hidden h-28 w-40 rotate-[-5deg] rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur sm:block">
            <p class="text-[8px] font-bold uppercase tracking-widest text-[#A8C0B4]">Your site</p>
            <p class="mt-1 font-display text-xl font-bold">Tola Thrift</p>
            <div class="mt-2 grid grid-cols-2 gap-1"><span class="h-9 rounded bg-brand-500" /><span class="h-9 rounded bg-cream/90" /></div>
            <p class="mt-2 text-[9px] text-[#A8C0B4]">tolathrift.ojaly.org</p>
          </div>
          <div class="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><Globe2 class="h-6 w-6 text-accent" /></div>
          <h3 class="relative mt-6 max-w-md font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{{ wide.title }}</h3>
          <p class="relative mt-4 max-w-md text-sm leading-relaxed text-[#BFD2C7]">{{ wide.body }}</p>
          <a href="#templates" class="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-400 hover:text-brand-300">{{ wide.linkLabel }} <ArrowUpRight class="h-4 w-4" /></a>
          <div class="relative mt-8 flex flex-wrap gap-2">
            <span v-for="tag in ['Search', 'Cart', 'Paystack', 'SEO ready', 'Open Graph', 'Embed widget']" :key="tag" class="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-[#D5E4DB]">{{ tag }}</span>
          </div>
        </div>
        <div v-for="feature in features" :key="feature.title" class="group rounded-3xl border border-line bg-surface p-6 transition hover:border-ink hover:shadow-soft">
          <div class="flex items-center justify-between">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><component :is="feature.icon" class="h-5 w-5" /></div>
            <ArrowUpRight class="h-4 w-4 text-line transition group-hover:text-brand-500" />
          </div>
          <h3 class="mt-4 font-display text-lg font-bold tracking-tight">{{ feature.title }}</h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-muted">{{ feature.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
