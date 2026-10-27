<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';
withDefaults(defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean; loading?: boolean }>(), { confirmLabel: 'Confirm', cancelLabel: 'Cancel', danger: false, loading: false });
const emit = defineEmits<{ confirm: []; cancel: []; 'update:open': [boolean] }>();
</script>

<template>
  <BaseModal :open="open" size="sm" @update:open="emit('update:open', $event)">
    <div class="text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" :class="danger ? 'bg-danger/10 text-danger' : 'bg-brand-50 text-brand-600 dark:bg-brand-500/15'">
        <slot name="icon">!</slot>
      </div>
      <h2 class="font-display text-xl font-bold">{{ title }}</h2>
      <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{{ message }}</p>
      <div class="mt-6 flex gap-3">
        <BaseButton variant="ghost" block :disabled="loading" @click="emit('cancel'); emit('update:open', false)">{{ cancelLabel }}</BaseButton>
        <BaseButton :variant="danger ? 'danger' : 'primary'" block :loading="loading" @click="emit('confirm')">{{ confirmLabel }}</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
