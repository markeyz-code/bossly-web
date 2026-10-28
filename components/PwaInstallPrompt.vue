<script setup lang="ts">
import { Download, X } from 'lucide-vue-next';
const visible = ref(false);
const deferredPrompt = ref<Event | null>(null);
const dismissed = useState('pwa-dismissed', () => false);

function onBeforeInstall(event: Event) {
  event.preventDefault();
  deferredPrompt.value = event;
  if (!dismissed.value) visible.value = true;
}
async function install() {
  if (!deferredPrompt.value) return;
  const prompt = deferredPrompt.value as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
  await prompt.prompt();
  await prompt.userChoice;
  visible.value = false;
  deferredPrompt.value = null;
}
function dismiss() {
  visible.value = false;
  dismissed.value = true;
  if (import.meta.client) sessionStorage.setItem('ojaly.pwa-dismissed', '1');
}
onMounted(() => {
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    if (sessionStorage.getItem('ojaly.pwa-dismissed')) dismissed.value = true;
  }
});
onBeforeUnmount(() => window.removeEventListener('beforeinstallprompt', onBeforeInstall));
</script>

<template>
  <Transition name="install">
    <div v-if="visible" class="fixed bottom-24 left-4 right-4 z-[80] flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lift sm:bottom-6 sm:left-auto sm:w-[380px]">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white"><Download class="h-5 w-5" /></div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold">Keep Ojaly one tap away</p>
        <p class="text-xs text-muted">Install the app. It works even on rough data.</p>
      </div>
      <button class="rounded-xl bg-ink px-3 py-2 text-xs font-bold text-canvas" @click="install">Install</button>
      <button class="text-muted" aria-label="Dismiss" @click="dismiss"><X class="h-4 w-4" /></button>
    </div>
  </Transition>
</template>

<style scoped>
.install-enter-active, .install-leave-active { transition: all .3s ease; }
.install-enter-from, .install-leave-to { opacity: 0; transform: translateY(12px); }
</style>
