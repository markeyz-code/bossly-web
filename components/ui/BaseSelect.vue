<script setup lang="ts">
import { Check, ChevronDown, Search } from 'lucide-vue-next';
import { useId } from 'vue';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  ariaLabel?: string;
  size?: 'sm' | 'md';
}>(), { placeholder: 'Select an option', searchable: false, size: 'md' });

const emit = defineEmits<{
  'update:modelValue': [string | number];
  change: [string | number];
}>();

const id = useId();
const listId = `${id}-listbox`;
const trigger = ref<HTMLButtonElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref('');
const activeIndex = ref(-1);
const menuStyle = ref<Record<string, string>>({});
const menuPlacement = ref<'bottom' | 'top'>('bottom');

const selected = computed(() => props.options.find((option) => String(option.value) === String(props.modelValue ?? '')));
const displayLabel = computed(() => selected.value?.label || props.placeholder);
const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((option) => `${option.label} ${option.description || ''}`.toLowerCase().includes(q));
});

function availableIndex(start: number, direction: 1 | -1): number {
  const total = filteredOptions.value.length;
  if (!total) return -1;
  for (let step = 0; step < total; step++) {
    const index = (start + step * direction + total) % total;
    if (!filteredOptions.value[index]?.disabled) return index;
  }
  return -1;
}

function updatePosition() {
  if (!import.meta.client || !trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  const desiredHeight = Math.min(320, Math.max(180, filteredOptions.value.length * 46 + (props.searchable ? 52 : 10)));
  const placement = spaceBelow < desiredHeight + 16 && spaceAbove > spaceBelow ? 'top' : 'bottom';
  menuPlacement.value = placement;
  const width = Math.max(rect.width, 190);
  const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
  menuStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${Math.max(160, placement === 'top' ? Math.min(desiredHeight, spaceAbove - 12) : Math.min(desiredHeight, spaceBelow - 12))}px`,
    ...(placement === 'top' ? { bottom: `${viewportHeight - rect.top + 6}px` } : { top: `${rect.bottom + 6}px` }),
    zIndex: '120',
  };
}

async function openMenu() {
  if (props.disabled || open.value) return;
  open.value = true;
  query.value = '';
  const selectedIndex = filteredOptions.value.findIndex((option) => String(option.value) === String(props.modelValue ?? ''));
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : availableIndex(0, 1);
  await nextTick();
  updatePosition();
  (props.searchable ? searchInput.value : trigger.value)?.focus();
  document.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
}

function closeMenu(restoreFocus = true) {
  if (!open.value) return;
  open.value = false;
  query.value = '';
  activeIndex.value = -1;
  document.removeEventListener('pointerdown', onPointerDown, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
  if (restoreFocus) trigger.value?.focus();
}

function toggle() { open.value ? closeMenu() : void openMenu(); }

function choose(option: SelectOption) {
  if (option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
  closeMenu();
}

function onPointerDown(event: PointerEvent) {
  if (!open.value) return;
  const target = event.target as Node;
  if (trigger.value?.contains(target)) return;
  const menu = document.getElementById(listId);
  if (menu?.contains(target)) return;
  closeMenu(false);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
    event.preventDefault();
    void openMenu();
  } else if (event.key === 'Escape') {
    closeMenu();
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeMenu(); return; }
  if (event.key === 'Tab') { closeMenu(false); return; }
  if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex.value = availableIndex(activeIndex.value + 1, 1); scrollActiveIntoView(); return; }
  if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex.value = availableIndex(activeIndex.value - 1 || filteredOptions.value.length - 1, -1); scrollActiveIntoView(); return; }
  if (event.key === 'Home') { event.preventDefault(); activeIndex.value = availableIndex(0, 1); scrollActiveIntoView(); return; }
  if (event.key === 'End') { event.preventDefault(); activeIndex.value = availableIndex(filteredOptions.value.length - 1, -1); scrollActiveIntoView(); return; }
  if (event.key === 'Enter') {
    event.preventDefault();
    const option = filteredOptions.value[activeIndex.value];
    if (option) choose(option);
    return;
  }
  if (!props.searchable && event.key.length === 1 && /\S/.test(event.key)) {
    const start = Math.max(0, activeIndex.value);
    const match = filteredOptions.value.findIndex((option, index) => index >= start && option.label.toLowerCase().startsWith(event.key.toLowerCase()));
    const fallback = filteredOptions.value.findIndex((option) => option.label.toLowerCase().startsWith(event.key.toLowerCase()));
    const index = match >= 0 ? match : fallback;
    if (index >= 0) { activeIndex.value = index; scrollActiveIntoView(); }
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    document.getElementById(`${listId}-option-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' });
  });
}

watch(() => props.options, () => { if (open.value) updatePosition(); });
watch(() => props.disabled, (disabled) => { if (disabled) closeMenu(); });
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" :id="`${id}-label`" :for="id" class="label-base">{{ label }} <span v-if="required" class="text-brand-500">*</span></label>
    <button
      :id="id"
      ref="trigger"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined"
      :aria-label="ariaLabel || label || placeholder"
      :aria-required="required || undefined"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      :disabled="disabled"
      class="group flex w-full items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-4 text-left text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
      :class="[size === 'sm' ? 'min-h-[40px] py-2 text-xs' : 'min-h-[48px] py-3 text-[15px]', error ? 'border-danger' : '', open ? 'border-brand ring-2 ring-brand/20' : '']"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span class="min-w-0 flex-1 truncate" :class="selected ? 'font-medium' : 'text-muted/70'">{{ displayLabel }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 text-muted transition" :class="open ? 'rotate-180' : ''" />
    </button>
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs text-muted">{{ hint }}</p>

    <Teleport to="body">
      <Transition name="select-pop">
        <div v-if="open" :id="listId" role="listbox" :aria-labelledby="`${id}-label`" :style="menuStyle" class="select-menu overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" :data-placement="menuPlacement" @keydown="onMenuKeydown">
          <div v-if="searchable" class="border-b border-line p-2">
            <div class="relative">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input ref="searchInput" v-model="query" type="search" placeholder="Search…" class="h-9 w-full rounded-xl border border-line bg-raised/60 pl-8 pr-3 text-xs text-ink outline-none focus:border-brand" aria-label="Search options">
            </div>
          </div>
          <div class="max-h-[260px] overflow-y-auto p-1.5">
            <button
              v-for="(option, index) in filteredOptions"
              :id="`${listId}-option-${index}`"
              :key="String(option.value)"
              type="button"
              role="option"
              :aria-selected="String(option.value) === String(modelValue ?? '')"
              :disabled="option.disabled"
              class="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40"
              :class="[index === activeIndex ? 'bg-raised' : '', String(option.value) === String(modelValue ?? '') ? 'text-ink' : 'text-muted hover:text-ink']"
              @mouseenter="activeIndex = index"
              @click="choose(option)"
            >
              <span class="min-w-0 flex-1"><span class="block text-[12px] font-semibold">{{ option.label }}</span><span v-if="option.description" class="mt-0.5 block text-[10px] leading-snug text-muted">{{ option.description }}</span></span>
              <Check v-if="String(option.value) === String(modelValue ?? '')" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
            </button>
            <p v-if="!filteredOptions.length" class="px-3 py-6 text-center text-xs text-muted">No matches. Try a different word.</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.select-pop-enter-active, .select-pop-leave-active { transition: opacity .14s ease, transform .14s ease; }
.select-pop-enter-from, .select-pop-leave-to { opacity: 0; transform: translateY(-4px) scale(.985); }
</style>
