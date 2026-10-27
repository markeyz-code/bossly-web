<script setup lang="ts">
withDefaults(defineProps<{ value: number; max?: number; label?: string; size?: 'sm' | 'md'; tone?: 'brand' | 'success' }>(), { max: 100, size: 'md', tone: 'brand' });
</script>

<template>
  <div>
    <div v-if="label" class="mb-1.5 flex justify-between text-[11px] font-semibold text-muted"><span>{{ label }}</span><span>{{ Math.round((value / max) * 100) }}%</span></div>
    <div class="overflow-hidden rounded-full bg-raised" :class="size === 'sm' ? 'h-1.5' : 'h-2.5'">
      <div class="h-full rounded-full transition-all duration-500" :class="tone === 'success' ? 'bg-success' : 'bg-brand-500'" :style="{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }" />
    </div>
  </div>
</template>
