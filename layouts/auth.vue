<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
    <section class="relative hidden overflow-hidden bg-forest-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div class="absolute inset-0 grid-paper opacity-20" />
      <div class="absolute -right-24 top-24 h-72 w-72 rounded-full bg-brand-500/90" />
      <div class="absolute bottom-24 right-32 h-20 w-20 rotate-12 rounded-3xl bg-accent" />
      <div class="relative">
        <NuxtLink to="/" aria-label="Bossly home"><LogoMark dark size="lg" /></NuxtLink>
      </div>
      <div class="relative max-w-xl">
        <p class="mb-4 inline-flex rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#A8C0B4]">Built for student businesses</p>
        <h1 class="font-display text-5xl font-bold leading-[0.98] tracking-[-0.05em] xl:text-6xl">Know your money.<br><span class="text-brand-400">Own your shine.</span></h1>
        <p class="mt-5 max-w-md text-base leading-relaxed text-[#BFD2C7]">Track sales, stock and debts in one place. Your catalog automatically becomes a free website.</p>
        <div class="mt-9 rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
          <p class="text-sm leading-relaxed text-[#E4EEE8]">“I used to guess my profit. Now I know it before I close my laptop. Bossly paid for itself in one week.”</p>
          <div class="mt-4 flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-forest-900">TA</span>
            <div><p class="text-sm font-bold">Tola A.</p><p class="text-[11px] text-[#8CAB99]">Founder, Tola Thrift · UNILAG</p></div>
          </div>
        </div>
      </div>
      <p class="relative text-xs text-[#7C9989]">Naira first. WhatsApp native. No jargon.</p>
    </section>

    <section class="flex flex-col bg-canvas">
      <div class="flex items-center justify-between p-5 sm:p-7">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink lg:invisible"><ArrowLeft class="h-4 w-4" /> Home</NuxtLink>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <div class="lg:hidden"><LogoMark /></div>
        </div>
      </div>
      <div class="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
        <div class="w-full max-w-md"><slot /></div>
      </div>
      <p class="px-5 pb-6 text-center text-[11px] text-muted sm:px-8">By continuing you agree to Bossly's fair-use terms. Your data belongs to you.</p>
    </section>
  </div>
</template>
