<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; wordmark?: boolean; dark?: boolean }>(), { size: 'md', wordmark: true });
const sizes = { sm: 'h-8 w-8 rounded-[10px]', md: 'h-10 w-10 rounded-xl', lg: 'h-12 w-12 rounded-2xl' };
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span class="relative inline-flex items-center justify-center bg-forest-900" :class="sizes[size]">
      <span class="absolute inset-[18%] rounded-[28%] bg-brand-500" />
      <span class="relative font-display text-[15px] font-bold leading-none text-cream" :class="size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-xs' : 'text-base'">o</span>
    </span>
    <span v-if="wordmark" class="font-display font-bold tracking-[-0.04em]" :class="[dark ? 'text-white' : 'text-ink', size === 'lg' ? 'text-2xl' : 'text-xl']">ojaly</span>
  </span>
</template>
