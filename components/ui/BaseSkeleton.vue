<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; class?: string }>(), { lines: 3 });
</script>

<template>
  <div class="animate-pulse space-y-3" :class="$props.class">
    <div v-for="line in lines" :key="line" class="h-4 rounded-full bg-raised" :class="line === lines ? 'w-2/3' : line === 1 ? 'w-1/2' : 'w-full'" />
  </div>
</template>
