<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import { useId } from 'vue';
defineProps<{ modelValue: boolean; label?: string; description?: string; disabled?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();
const id = useId();
</script>

<template>
  <label :for="id" class="flex cursor-pointer items-start gap-3" :class="disabled ? 'opacity-60' : ''">
    <span class="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-line bg-surface transition" :class="modelValue ? 'border-forest-900 bg-forest-900 dark:border-accent dark:bg-accent' : ''">
      <Check v-if="modelValue" class="h-3.5 w-3.5 text-white dark:text-forest-900" :stroke-width="3" />
      <input :id="id" type="checkbox" class="sr-only" :checked="modelValue" :disabled="disabled" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
    </span>
    <span v-if="label || description">
      <span class="block text-sm font-semibold">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-xs leading-relaxed text-muted">{{ description }}</span>
    </span>
  </label>
</template>
