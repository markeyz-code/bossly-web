<script setup lang="ts">
const props = withDefaults(defineProps<{ variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand' | 'info' | 'dark'; dot?: boolean; size?: 'sm' | 'md' }>(), { variant: 'neutral', dot: false, size: 'sm' });
const styles = {
  neutral: 'bg-raised text-ink border-line',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/25',
  danger: 'bg-danger/10 text-danger border-danger/20',
  brand: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30',
  info: 'bg-forest-500/10 text-forest-600 border-forest-500/20 dark:text-forest-300',
  dark: 'bg-ink text-canvas border-ink',
};
const dots = { neutral: 'bg-muted', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', brand: 'bg-brand-500', info: 'bg-forest-500', dark: 'bg-canvas' };
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full border font-semibold" :class="[styles[props.variant], props.size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs']">
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full" :class="dots[props.variant]" />
    <slot />
  </span>
</template>
