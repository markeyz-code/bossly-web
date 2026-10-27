<script setup lang="ts">
import { CloudOff, RefreshCw } from 'lucide-vue-next';
definePageMeta({ layout: false });
useSeoMeta({ title: 'You are offline', robots: 'noindex' });
const offline = useOfflineStore();
onMounted(() => offline.hydrate());
function retry() { if (navigator.onLine) void navigateTo('/app'); else location.reload(); }
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas px-5 py-16">
    <div class="max-w-md text-center">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border-2 border-ink bg-accent text-forest-900 shadow-chunky-sm"><CloudOff class="h-9 w-9" /></div>
      <h1 class="mt-6 font-display text-4xl font-bold tracking-tight">The internet blinked.</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted">Your app is still here. Sales and expenses you record now will queue on this device and sync automatically when you reconnect.</p>
      <div v-if="offline.pendingCount" class="mt-4 rounded-2xl border border-line bg-surface p-3 text-xs font-semibold">{{ offline.pendingCount }} queued {{ offline.pendingCount === 1 ? 'entry' : 'entries' }} waiting to sync.</div>
      <button class="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-ink px-5 text-sm font-bold text-canvas" @click="retry"><RefreshCw class="h-4 w-4" /> {{ offline.online ? 'Back to app' : 'Try again' }}</button>
      <p class="mt-4 text-[11px] text-muted">No data lost. That's the Bossly promise.</p>
    </div>
  </div>
</template>
