<script setup lang="ts">
import { ArrowRight, Check, ChevronDown, Rocket } from 'lucide-vue-next';
const props = defineProps<{ onboarding: { steps: { key: string; label: string; done: boolean; href: string }[]; completed: number; total: number; percent: number; complete: boolean } | null }>();
const collapsed = ref(false);
</script>

<template>
  <div v-if="props.onboarding && !props.onboarding.complete" class="overflow-hidden rounded-3xl border-2 border-ink bg-accent text-forest-900 shadow-[5px_5px_0_0_#06231A]">
    <button type="button" class="flex w-full items-center gap-3 p-5 text-left" @click="collapsed = !collapsed">
      <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-900 text-accent"><Rocket class="h-6 w-6" /></span>
      <span class="min-w-0 flex-1">
        <span class="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-900/60">Getting-started checklist</span>
        <span class="block font-display text-xl font-bold tracking-tight">{{ props.onboarding.completed }} of {{ props.onboarding.total }} done — you’re nearly there</span>
      </span>
      <span class="font-display text-2xl font-bold">{{ props.onboarding.percent }}%</span>
      <ChevronDown class="h-5 w-5 transition" :class="collapsed ? '' : 'rotate-180'" />
    </button>
    <div v-if="!collapsed" class="border-t border-forest-900/15 px-5 pb-5 pt-3">
      <div class="mb-4 h-2 overflow-hidden rounded-full bg-forest-900/15"><div class="h-full rounded-full bg-forest-900 transition-all duration-500" :style="{ width: `${props.onboarding.percent}%` }" /></div>
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <NuxtLink v-for="step in props.onboarding.steps" :key="step.key" :to="step.href" class="flex min-h-[52px] items-center gap-2.5 rounded-xl bg-white/50 px-3 text-xs font-bold transition hover:bg-white/80">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2" :class="step.done ? 'border-forest-900 bg-forest-900 text-white' : 'border-forest-900/30'"><Check v-if="step.done" class="h-3.5 w-3.5" :stroke-width="3" /></span>
          <span :class="step.done ? 'line-through opacity-60' : ''">{{ step.label }}</span>
          <ArrowRight v-if="!step.done" class="ml-auto h-3.5 w-3.5 shrink-0" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
