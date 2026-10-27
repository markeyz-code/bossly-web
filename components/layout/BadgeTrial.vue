<script setup lang="ts">
defineProps<{ days: number }>();
</script>

<template>
  <span class="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-forest-900">{{ days }}d</span>
</template>
