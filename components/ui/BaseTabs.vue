<script setup lang="ts">
defineProps<{ modelValue: string; items: { key: string; label: string; count?: number; icon?: unknown }[]; variant?: 'pill' | 'underline' }>();
const emit = defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
  <div v-if="variant === 'underline'" class="scrollbar-none flex gap-5 overflow-x-auto border-b border-line">
    <button v-for="item in items" :key="item.key" type="button" class="-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition" :class="modelValue === item.key ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink'" @click="emit('update:modelValue', item.key)">
      {{ item.label }}
      <span v-if="item.count !== undefined" class="rounded-full bg-raised px-1.5 py-0.5 text-[10px]">{{ item.count }}</span>
    </button>
  </div>
  <div v-else class="scrollbar-none flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-surface p-1.5">
    <button v-for="item in items" :key="item.key" type="button" class="flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition" :class="modelValue === item.key ? 'bg-ink text-canvas shadow-sm' : 'text-muted hover:bg-raised hover:text-ink'" @click="emit('update:modelValue', item.key)">
      {{ item.label }}
      <span v-if="item.count !== undefined" class="rounded-full px-1.5 py-0.5 text-[10px]" :class="modelValue === item.key ? 'bg-white/15' : 'bg-raised'">{{ item.count }}</span>
    </button>
  </div>
</template>
