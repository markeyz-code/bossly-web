<script setup lang="ts">
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
withDefaults(defineProps<{
  label: string;
  value?: number;
  format?: 'money' | 'number' | 'text';
  change?: number;
  hint?: string;
  tone?: 'default' | 'brand' | 'dark' | 'accent';
  loading?: boolean;
}>(), { format: 'money', tone: 'default', loading: false });
const tones = {
  default: 'bg-surface border-line',
  brand: 'bg-brand-500 border-brand-600 text-white',
  dark: 'bg-forest-900 border-forest-800 text-white',
  accent: 'bg-accent border-[#D9BC2F] text-forest-900',
};
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl border p-5 shadow-soft" :class="tones[tone]">
    <div v-if="loading" class="space-y-3">
      <div class="h-3 w-24 animate-pulse rounded-full bg-current/20" />
      <div class="h-8 w-32 animate-pulse rounded-full bg-current/20" />
    </div>
    <template v-else>
      <div class="flex items-start justify-between gap-2">
        <p class="text-[11px] font-bold uppercase tracking-[0.16em]" :class="tone === 'default' ? 'text-muted' : 'opacity-70'">{{ label }}</p>
        <span v-if="change !== undefined" class="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold" :class="change >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'">
          <ArrowUpRight v-if="change >= 0" class="h-3 w-3" /><ArrowDownRight v-else class="h-3 w-3" />{{ Math.abs(change) }}%
        </span>
      </div>
      <p class="mt-2 font-display text-stat tracking-tight">
        <template v-if="format === 'money'">{{ formatNaira(value) }}</template>
        <template v-else-if="format === 'number'">{{ (value || 0).toLocaleString('en-NG') }}</template>
        <template v-else>{{ value }}</template>
      </p>
      <p v-if="hint" class="mt-1.5 text-xs" :class="tone === 'default' ? 'text-muted' : 'opacity-70'">{{ hint }}</p>
    </template>
    <slot />
  </div>
</template>
