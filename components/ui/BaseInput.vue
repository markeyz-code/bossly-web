<script setup lang="ts">
import { useId } from 'vue';
const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'search' | 'url';
  prefix?: string;
  maxlength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}>(), { type: 'text', required: false, disabled: false });
const emit = defineEmits<{ 'update:modelValue': [string]; blur: [FocusEvent] }>();
const id = useId();
const value = computed({
  get: () => props.modelValue ?? '',
  set: (v: string) => emit('update:modelValue', v),
});
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="label-base">{{ label }} <span v-if="required" class="text-brand-500">*</span></label>
    <div class="relative">
      <span v-if="prefix" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">{{ prefix }}</span>
      <input
        :id="id"
        v-model="value"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        class="input-base"
        :class="[prefix ? 'pl-10' : '', error ? 'border-danger focus:border-danger focus:ring-danger/20' : '']"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
        @blur="emit('blur', $event)"
      >
      <slot name="suffix" />
    </div>
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
