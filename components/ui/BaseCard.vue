<script setup lang="ts">
withDefaults(defineProps<{ padding?: 'none' | 'sm' | 'md' | 'lg'; hover?: boolean; flat?: boolean; as?: string }>(), { padding: 'md', hover: false, flat: false, as: 'div' });
const pad = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };
</script>

<template>
  <component :is="as" class="rounded-3xl border border-line bg-surface" :class="[flat ? '' : 'shadow-soft', pad[padding], hover ? 'transition hover:-translate-y-0.5 hover:shadow-lift' : '']">
    <slot />
  </component>
</template>
