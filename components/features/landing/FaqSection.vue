<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
const faqs = [
  { q: 'Do I really get a free website?', a: 'Yes. Every business gets a storefront generated from the products you already add. It has home, product listing, product pages, cart, checkout, about and contact. You can publish it in one tap.' },
  { q: 'Can I use Bossly without the website?', a: 'Of course. If you already have a site, use the back office only, or drop our order widget onto your existing site. The management system is the product; the site is the bonus.' },
  { q: 'I sell mostly on WhatsApp. Will this work?', a: 'That is exactly who we built it for. Paste a customer chat and Bossly extracts the order. You can also link your number and text our bot things like “sold 2 shirts 5000”. Every order is confirmed before it is saved.' },
  { q: 'How do I know my profit is correct?', a: 'Every sale stores the cost price at the time of sale. Bossly subtracts cost of goods and your recorded expenses from revenue. You see gross profit and net profit, plus a plain-language explanation.' },
  { q: 'What happens when my trial ends?', a: 'Your account drops to the free plan. Nothing is deleted. You keep your data, your sales history and your website. Paid limits on products, staff seats and exports simply apply until you upgrade.' },
  { q: 'Can my staff use it?', a: 'Yes. Owners can invite staff and choose exactly which areas they can access — sales, stock, customers and debts. Staff cannot change your plan or sensitive settings.' },
  { q: 'Is my money handled by Bossly?', a: 'No. Payments go through Paystack straight to your own settlement account. Bossly records the transaction, updates the order or debt and issues the receipt.' },
  { q: 'Does it work when network is bad?', a: 'Bossly caches the app shell and queues sales and expenses recorded offline. When your connection returns, they sync automatically. Images are compressed before upload.' },
];
const open = ref<number | null>(0);
</script>

<template>
  <section id="faq" class="border-b border-line bg-surface py-16 sm:py-24">
    <div class="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p class="eyebrow">Questions</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em]">Ask us anything.</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted">Straight answers, no jargon. Still unsure? Message us on WhatsApp and a human will reply.</p>
        <a href="https://wa.me/2348000000000" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-forest-900">Chat with a human →</a>
      </div>
      <div class="divide-y divide-line rounded-3xl border border-line bg-canvas px-5 sm:px-7">
        <div v-for="(faq, index) in faqs" :key="faq.q" class="py-1">
          <button type="button" class="flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left" :aria-expanded="open === index" @click="open = open === index ? null : index">
            <span class="text-sm font-bold sm:text-[15px]">{{ faq.q }}</span>
            <Plus class="h-5 w-5 shrink-0 text-brand-500 transition duration-300" :class="open === index ? 'rotate-45' : ''" />
          </button>
          <div class="grid transition-all duration-300" :class="open === index ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'">
            <p class="overflow-hidden text-[13px] leading-relaxed text-muted">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
