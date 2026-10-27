<script setup lang="ts">
import { ArrowLeft, Compass } from 'lucide-vue-next';
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>();
const is404 = computed(() => props.error.statusCode === 404);
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas px-5 py-16">
    <div class="max-w-lg text-center">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border-2 border-ink bg-brand-500 text-white shadow-chunky-sm">
        <Compass class="h-9 w-9" />
      </div>
      <p class="eyebrow">{{ error.statusCode || 500 }}</p>
      <h1 class="mt-2 font-display text-4xl font-bold tracking-tight">{{ is404 ? 'This page took a detour' : 'Small wahala. Big fix coming.' }}</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted">{{ is404 ? 'The link is broken or the page moved. Your business is safe.' : (error.message || 'Something went wrong. Try again in a moment.') }}</p>
      <div class="mt-7 flex justify-center gap-3">
        <button class="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-ink px-5 text-sm font-bold text-canvas" @click="clearError({ redirect: '/' })"><ArrowLeft class="h-4 w-4" /> Go home</button>
      </div>
    </div>
  </div>
</template>
