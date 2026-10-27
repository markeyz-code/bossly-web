<script setup lang="ts">
import { ArrowRight, MessageCircle } from 'lucide-vue-next';
const auth = useAuthStore();
</script>

<template>
  <section class="relative overflow-hidden bg-brand-500 py-16 text-white sm:py-24">
    <div class="absolute inset-0 grid-paper opacity-20" />
    <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[30px] border-forest-900/20" />
    <div class="shell relative text-center">
      <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Your next level is a record away</p>
      <h2 class="mx-auto mt-4 max-w-3xl text-balance font-display text-5xl font-bold tracking-[-0.05em] sm:text-7xl">Stop guessing.<br><span class="text-forest-900">Start knowing.</span></h2>
      <p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">Set up your business, record one sale and see your first real profit number today. Your free storefront comes along for the ride.</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <BaseButton :to="auth.isAuthenticated ? '/app' : '/register'" variant="dark" size="lg">{{ auth.isAuthenticated ? 'Open dashboard' : 'Start free now' }} <ArrowRight class="h-5 w-5" /></BaseButton>
        <a href="https://wa.me/2348000000000" target="_blank" rel="noopener" class="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border-2 border-white/40 px-6 text-sm font-bold text-white transition hover:bg-white/10"><MessageCircle class="h-5 w-5" /> Ask on WhatsApp</a>
      </div>
      <p class="mt-5 text-[11px] text-white/70">No card. No developer. No wahala.</p>
    </div>
  </section>
</template>
