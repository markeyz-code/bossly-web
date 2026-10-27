<script setup lang="ts">
import { computed } from 'vue';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';

const props = withDefaults(defineProps<{ data: { date: string; revenueKobo: number; profitKobo: number }[]; loading?: boolean; height?: number }>(), { loading: false, height: 240 });
const width = 720;
const padding = { top: 18, right: 12, bottom: 30, left: 62 };
const max = computed(() => Math.max(1, ...props.data.map((d) => Math.max(d.revenueKobo, d.profitKobo)), 100));
const innerW = computed(() => width - padding.left - padding.right);
const innerH = computed(() => props.height - padding.top - padding.bottom);
function x(index: number) { return padding.left + (props.data.length <= 1 ? innerW.value / 2 : (index / (props.data.length - 1)) * innerW.value); }
function y(value: number) { return padding.top + innerH.value - (Math.max(0, value) / max.value) * innerH.value; }
function line(key: 'revenueKobo' | 'profitKobo') {
  if (!props.data.length) return '';
  return props.data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
}
function area(key: 'revenueKobo' | 'profitKobo') {
  if (!props.data.length) return '';
  return `${line(key)} L${x(props.data.length - 1)},${padding.top + innerH.value} L${x(0)},${padding.top + innerH.value} Z`;
}
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((f) => max.value * f));
const labels = computed(() => {
  if (!props.data.length) return [];
  if (props.data.length === 1) return [formatDate(props.data[0].date, { day: 'numeric', month: 'short' })];
  const count = Math.min(6, props.data.length);
  return Array.from({ length: count }, (_, i) => formatDate(props.data[Math.round((i / (count - 1)) * (props.data.length - 1))]?.date, { day: 'numeric', month: 'short' }));
});
</script>

<template>
  <div v-if="loading" class="skeleton" :style="{ height: `${height}px` }" />
  <div v-else-if="!data.length" class="flex flex-col items-center justify-center rounded-2xl bg-raised/60 text-center" :style="{ height: `${height}px` }">
    <p class="text-sm font-semibold">No sales in this period yet</p>
    <p class="mt-1 text-xs text-muted">Record a sale and your chart starts here.</p>
  </div>
  <div v-else class="w-full">
    <svg :viewBox="`0 0 ${width} ${height}`" class="h-auto w-full overflow-visible" role="img" aria-label="Revenue and profit chart">
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF5A1F" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#FF5A1F" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g v-for="tick in ticks" :key="tick">
        <line :x1="padding.left" :x2="width - padding.right" :y1="y(tick)" :y2="y(tick)" stroke="currentColor" stroke-opacity=".08" stroke-dasharray="4 6" />
        <text :x="padding.left - 10" :y="y(tick) + 4" text-anchor="end" class="fill-muted text-[10px]">{{ formatNaira(tick, { compact: true }) }}</text>
      </g>
      <path :d="area('revenueKobo')" fill="url(#revenueFill)" />
      <path :d="line('revenueKobo')" fill="none" stroke="#FF5A1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path :d="line('profitKobo')" fill="none" stroke="#0B8A5A" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round" />
      <g v-for="(label, index) in labels" :key="label + index">
        <text :x="padding.left + (labels.length <= 1 ? innerW / 2 : (index / (labels.length - 1)) * innerW)" :y="height - 8" text-anchor="middle" class="fill-muted text-[10px]">{{ label }}</text>
      </g>
    </svg>
    <div class="mt-1 flex items-center justify-center gap-5 text-[11px] font-semibold text-muted">
      <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-brand-500" /> Revenue</span>
      <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-success" /> Gross profit</span>
    </div>
  </div>
</template>
