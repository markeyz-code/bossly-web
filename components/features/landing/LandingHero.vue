<script setup lang="ts">
import { ArrowRight, Check, MessageCircle, PlayCircle, TrendingUp } from 'lucide-vue-next';
const auth = useAuthStore();
</script>

<template>
  <section class="relative overflow-hidden border-b border-line">
    <div class="absolute inset-0 grid-paper opacity-[0.35]" />
    <div class="shell relative grid gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
      <div class="max-w-2xl">
        <div class="mb-6 inline-flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-accent px-3 py-1.5 text-[11px] font-bold text-forest-900"><span class="h-1.5 w-1.5 rounded-full bg-forest-900" /> Built for Nigerian student businesses</span>
          <span class="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted">Free website included</span>
        </div>
        <h1 class="font-display text-[clamp(3rem,7vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.06em]">
          Run your business.<br>
          <span class="relative inline-block">
            <span class="relative z-10">Get a website.</span>
            <span class="absolute bottom-1 left-0 z-0 h-[24%] w-full -rotate-1 bg-brand-500/80" />
          </span>
        </h1>
        <p class="mt-7 max-w-lg text-balance text-base leading-relaxed text-muted sm:text-lg">
          Bossly is the management system that shows you real profit, tracks stock and debts, and turns your catalog into a free online store. No designer. No developer. No guessing.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <BaseButton :to="auth.isAuthenticated ? '/app' : '/register'" size="lg" class="group">
            {{ auth.isAuthenticated ? 'Open my dashboard' : 'Start free — no card' }}
            <ArrowRight class="h-5 w-5 transition group-hover:translate-x-1" />
          </BaseButton>
          <BaseButton href="#how" size="lg" variant="outline"><PlayCircle class="h-5 w-5" /> See how it works</BaseButton>
        </div>
        <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted">
          <span class="inline-flex items-center gap-1.5"><Check class="h-4 w-4 text-success" /> Under 5 minutes</span>
          <span class="inline-flex items-center gap-1.5"><Check class="h-4 w-4 text-success" /> WhatsApp-native</span>
          <span class="inline-flex items-center gap-1.5"><Check class="h-4 w-4 text-success" /> Naira everything</span>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-[560px]">
        <div class="absolute -left-5 top-16 hidden h-24 w-24 -rotate-6 rounded-[2rem] bg-accent border-2 border-ink sm:block" />
        <div class="absolute -right-4 bottom-12 hidden h-16 w-16 rotate-12 rounded-2xl bg-brand-500 sm:block" />
        <div class="relative rotate-[1.5deg] rounded-[2rem] border-2 border-ink bg-surface p-3 shadow-[10px_12px_0_0_#06231A]">
          <div class="rounded-[1.4rem] bg-forest-900 p-5 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 font-display font-bold">b</span><span class="text-xs font-bold">Tola Thrift</span></div>
              <span class="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-[#A8C0B4]">THIS MONTH</span>
            </div>
            <div class="mt-5">
              <p class="text-[11px] font-semibold uppercase tracking-wider text-[#A8C0B4]">Profit, not vibes</p>
              <p class="mt-1 font-display text-5xl font-bold tracking-tight">₦146,500</p>
              <p class="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8BE3BB]"><TrendingUp class="h-3.5 w-3.5" /> Up 23% from last month</p>
            </div>
            <div class="mt-5 grid grid-cols-3 gap-2">
              <div class="rounded-xl bg-white/10 p-2.5"><p class="text-[9px] text-[#A8C0B4]">Sales</p><p class="mt-0.5 text-sm font-bold">₦412k</p></div>
              <div class="rounded-xl bg-white/10 p-2.5"><p class="text-[9px] text-[#A8C0B4]">Owed</p><p class="mt-0.5 text-sm font-bold text-accent">₦38k</p></div>
              <div class="rounded-xl bg-white/10 p-2.5"><p class="text-[9px] text-[#A8C0B4]">Stock</p><p class="mt-0.5 text-sm font-bold">14 items</p></div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-[1fr_0.9fr] gap-3">
            <div class="rounded-2xl border border-line bg-canvas p-3">
              <div class="flex items-center gap-1.5 text-[9px] font-bold text-muted"><MessageCircle class="h-3 w-3" /> WHATSAPP ORDER</div>
              <p class="mt-2 text-[11px] leading-relaxed">“I want 2 black hoodies and 1 cap. Deliver to Yaba.”</p>
              <div class="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[9px] font-bold text-success"><Check class="h-2.5 w-2.5" /> Order drafted</div>
            </div>
            <div class="overflow-hidden rounded-2xl border border-line bg-[#FBF7EF] p-3 text-forest-900">
              <p class="text-[8px] font-bold uppercase tracking-widest text-[#FF5A1F]">Tola Thrift</p>
              <p class="mt-1 font-display text-lg font-bold leading-none tracking-tight">Campus fits.</p>
              <div class="mt-2 flex gap-1"><span class="h-10 w-1/2 rounded-md bg-[#06231A]" /><span class="h-10 w-1/2 rounded-md bg-[#FF5A1F]" /></div>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-5 -left-4 rotate-[-3deg] rounded-2xl border border-line bg-surface px-3.5 py-2.5 shadow-lift sm:-left-10">
          <p class="text-[9px] font-bold uppercase tracking-wider text-muted">Website</p>
          <p class="text-xs font-bold text-success">● Live automatically</p>
        </div>
      </div>
    </div>
    <div class="border-t border-line bg-forest-900 py-3 text-white">
      <div class="overflow-hidden whitespace-nowrap">
        <div class="animate-marquee inline-flex gap-8 text-xs font-bold uppercase tracking-[0.16em] text-[#A8C0B4]">
          <span v-for="i in 2" :key="i" class="inline-flex gap-8">
            <span>Real profit</span><span class="text-brand-400">✦</span><span>Stock you can trust</span><span class="text-accent">✦</span><span>Debts tracked</span><span class="text-brand-400">✦</span><span>Free storefront</span><span class="text-accent">✦</span><span>WhatsApp orders</span><span class="text-brand-400">✦</span><span>Made in Nigeria</span><span class="text-accent">✦</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
