<script setup lang="ts">
import { initials } from '~/utils/entities';
import { optimizedImage } from '~/utils/cloudinary';
withDefaults(defineProps<{ name?: string | null; src?: string | null; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });
const sizes = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-base' };
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-accent font-bold text-forest-900" :class="sizes[size]">
    <img v-if="src" :src="optimizedImage(src, 120)" :alt="name || 'Avatar'" class="h-full w-full object-cover">
    <span v-else>{{ initials(name) }}</span>
  </span>
</template>
