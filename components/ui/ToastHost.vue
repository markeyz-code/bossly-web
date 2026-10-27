<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-vue-next';
const { toasts, dismiss } = useToast();
const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
const styles = {
  success: 'border-success/30 bg-forest-900 text-white',
  error: 'border-danger/30 bg-[#3B1212] text-white',
  info: 'border-forest-500/30 bg-forest-900 text-white',
  warning: 'border-warning/30 bg-[#3A2B10] text-white',
};
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-4 top-4 z-[200] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:top-6 sm:w-[380px]">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-lift backdrop-blur" :class="styles[toast.tone]" role="status">
          <component :is="icons[toast.tone]" class="mt-0.5 h-5 w-5 shrink-0" />
          <div class="min-w-0 flex-1">
            <p v-if="toast.title" class="text-sm font-bold">{{ toast.title }}</p>
            <p class="text-[13px] leading-relaxed opacity-90">{{ toast.message }}</p>
          </div>
          <button type="button" class="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss" @click="dismiss(toast.id)"><X class="h-4 w-4" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .28s cubic-bezier(.34,1.56,.64,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px) scale(.96); }
</style>
