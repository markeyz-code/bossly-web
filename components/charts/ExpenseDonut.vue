<script setup lang="ts">
import { computed } from 'vue';
import { formatNaira } from '~/utils/money';
import { titleCase } from '~/utils/entities';
const props = defineProps<{ data: { category: string; totalKobo: number }[] }>();
const colors = ['#FF5A1F', '#0B3D2E', '#F5D547', '#247A55', '#E88A5C', '#8B5CF6', '#6B7B72'];
const total = computed(() => props.data.reduce((s, d) => s + d.totalKobo, 0));
const gradient = computed(() => {
  if (!total.value) return 'conic-gradient(#E5DED0 0 100%)';
  let cursor = 0;
  const stops = props.data.map((d, i) => {
    const start = cursor;
    cursor += (d.totalKobo / total.value) * 100;
    return `${colors[i % colors.length]} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
});
</script>

<template>
  <div class="flex flex-col items-center gap-5 sm:flex-row">
    <div class="relative h-36 w-36 shrink-0">
      <div class="h-full w-full rounded-full" :style="{ background: gradient }" />
      <div class="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-surface text-center">
        <span class="text-[9px] font-bold uppercase tracking-wider text-muted">Spent</span>
        <span class="font-display text-lg font-bold">{{ formatNaira(total, { compact: true }) }}</span>
      </div>
    </div>
    <div class="w-full space-y-2">
      <div v-for="(item, index) in data.slice(0, 5)" :key="item.category" class="flex items-center justify-between gap-3 text-xs">
        <span class="inline-flex items-center gap-2 font-semibold"><span class="h-2.5 w-2.5 rounded-sm" :style="{ background: colors[index % colors.length] }" />{{ titleCase(item.category) }}</span>
        <span class="text-muted">{{ formatNaira(item.totalKobo) }}</span>
      </div>
      <p v-if="!data.length" class="text-xs text-muted">No expenses recorded yet.</p>
    </div>
  </div>
</template>
