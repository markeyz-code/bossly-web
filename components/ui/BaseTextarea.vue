<script setup lang="ts">
import { useId } from 'vue';
const props = defineProps<{ modelValue?: string; label?: string; placeholder?: string; error?: string; hint?: string; rows?: number; required?: boolean; maxlength?: number }>();
const emit = defineEmits<{ 'update:modelValue': [string] }>();
const id = useId();
const value = computed({ get: () => props.modelValue || '', set: (v: string) => emit('update:modelValue', v) });
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="label-base">{{ label }} <span v-if="required" class="text-brand-500">*</span></label>
    <textarea
      :id="id"
      v-model="value"
      :rows="rows || 4"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxlength"
      class="input-base resize-y leading-relaxed"
      :class="error ? 'border-danger' : ''"
      :aria-invalid="Boolean(error)"
    />
    <p v-if="error" class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
