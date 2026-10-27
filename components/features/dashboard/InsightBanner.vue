<script setup lang="ts">
import { Lightbulb, Sparkles } from 'lucide-vue-next';
defineProps<{ insights: string[] }>();
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl border border-line bg-forest-900 p-5 text-white sm:p-6">
    <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl" />
    <div class="relative flex items-start gap-4">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-forest-900"><Lightbulb class="h-5 w-5" /></div>
      <div class="min-w-0">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A8C0B4]">What your numbers are saying</p>
        <p class="mt-1.5 text-sm font-semibold leading-relaxed sm:text-base">{{ insights[0] }}</p>
        <details v-if="insights.length > 1" class="group mt-2">
          <summary class="cursor-pointer list-none text-xs font-bold text-brand-400 hover:text-brand-300">More insights <span class="inline-block transition group-open:rotate-90">→</span></summary>
          <ul class="mt-2 space-y-2 text-xs leading-relaxed text-[#C7D8CE]">
            <li v-for="(insight, index) in insights.slice(1)" :key="index" class="flex gap-2"><Sparkles class="mt-0.5 h-3 w-3 shrink-0 text-accent" />{{ insight }}</li>
          </ul>
        </details>
      </div>
    </div>
  </div>
</template>
