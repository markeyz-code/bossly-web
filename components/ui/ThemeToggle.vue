<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
const { isDark, toggle } = useTheme();
</script>

<template>
  <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:bg-raised" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
    <Sun v-if="isDark" class="h-[18px] w-[18px]" />
    <Moon v-else class="h-[18px] w-[18px]" />
  </button>
</template>
