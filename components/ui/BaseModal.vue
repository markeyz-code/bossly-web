<script setup lang="ts">
import { X } from 'lucide-vue-next';
const props = withDefaults(defineProps<{ open: boolean; title?: string; description?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; closeOnBackdrop?: boolean }>(), { size: 'md', closeOnBackdrop: true });
const emit = defineEmits<{ 'update:open': [boolean]; close: [] }>();
const panel = ref<HTMLElement | null>(null);
const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

function close() { emit('update:open', false); emit('close'); }
function onKey(event: KeyboardEvent) {
  if (!props.open) return;
  if (event.key === 'Escape') close();
  if (event.key !== 'Tab' || !panel.value) return;
  const focusable = panel.value.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0]; const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
watch(() => props.open, async (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    await nextTick();
    panel.value?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();
  }
});
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; });
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[100] flex items-end justify-center bg-forest-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" :aria-label="title" @mousedown.self="closeOnBackdrop && close()">
        <div ref="panel" class="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-line bg-surface p-5 shadow-lift sm:rounded-[2rem] sm:p-7" :class="sizes[size]">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 v-if="title" class="font-display text-xl font-bold tracking-tight sm:text-2xl">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
            </div>
            <button type="button" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-raised text-ink hover:bg-line" aria-label="Close" @click="close">
              <X class="h-5 w-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active > div, .modal-leave-active > div { transition: transform .28s cubic-bezier(.34,1.56,.64,1); }
.modal-enter-from > div, .modal-leave-to > div { transform: translateY(24px) scale(.98); }
</style>
