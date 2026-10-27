<script setup lang="ts">
import { ArrowRight, Sparkles } from 'lucide-vue-next';
defineProps<{ title: string; message?: string; actionLabel?: string; compact?: boolean }>();
const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center" :class="compact ? 'px-4 py-10' : 'px-6 py-16'">
    <div class="relative mb-5">
      <div class="absolute -left-7 top-2 h-8 w-8 rounded-full bg-accent/60" />
      <div class="absolute -right-6 bottom-0 h-5 w-5 rounded-lg bg-brand-200 rotate-12 dark:bg-brand-500/30" />
      <div class="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border-2 border-ink bg-brand-500 text-white shadow-chunky-sm">
        <slot name="icon"><Sparkles class="h-9 w-9" /></slot>
      </div>
    </div>
    <h3 class="font-display text-xl font-bold tracking-tight">{{ title }}</h3>
    <p v-if="message" class="mt-2 max-w-sm text-sm leading-relaxed text-muted">{{ message }}</p>
    <slot name="action">
      <button v-if="actionLabel" type="button" class="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-canvas transition hover:gap-3" @click="emit('action')">
        {{ actionLabel }} <ArrowRight class="h-4 w-4" />
      </button>
    </slot>
  </div>
</template>
