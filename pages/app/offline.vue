<script setup lang="ts">
import { CloudOff, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-vue-next';
import { formatDateTime } from '~/utils/date';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Offline queue' });
const toast = useToast();
const offline = useOfflineQueue();
async function syncAll() { const result = await offline.sync(); if (!result.synced && !result.failed) toast.info('Nothing to sync yet.'); }
onMounted(() => offline.hydrate());
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Offline queue" subtitle="Sales and expenses recorded without network. They sync when you're back." eyebrow="Resilience">
      <template #actions><BaseButton :loading="offline.syncing" @click="syncAll"><RefreshCw class="h-4 w-4" /> Sync now</BaseButton></template>
    </PageHeader>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Connection</p><p class="mt-1 flex items-center gap-1.5 font-display text-xl font-bold" :class="offline.online ? 'text-success' : 'text-danger'"><Wifi v-if="offline.online" class="h-5 w-5" /><WifiOff v-else class="h-5 w-5" />{{ offline.online ? 'Online' : 'Offline' }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Waiting</p><p class="mt-1 font-display text-xl font-bold">{{ offline.pendingCount }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Needs attention</p><p class="mt-1 font-display text-xl font-bold text-danger">{{ offline.failed.length }}</p></div>
    </div>
    <BaseEmptyState v-if="!offline.queue.length" title="Nothing queued" message="You're fully synced. Sales recorded offline will show up here until they reach the server."><template #icon><CloudOff class="h-8 w-8" /></template></BaseEmptyState>
    <div v-else class="space-y-2">
      <div v-for="item in offline.queue" :key="item.id" class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="item.status === 'failed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'"><CloudOff class="h-5 w-5" /></div>
          <div class="min-w-0 flex-1"><p class="text-sm font-bold capitalize">{{ item.type }} recorded offline</p><p class="text-[10px] text-muted">{{ formatDateTime(item.createdAt) }} · attempt {{ item.attempts }} · {{ item.status }}</p><p v-if="item.error" class="mt-1 text-[11px] font-semibold text-danger">{{ item.error }}</p></div>
          <div class="flex gap-1"><BaseButton v-if="item.status === 'failed'" size="sm" variant="outline" @click="offline.retry(item.id)">Retry</BaseButton><button class="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger/5" aria-label="Remove from queue" @click="offline.remove(item.id)"><Trash2 class="h-4 w-4" /></button></div>
        </div>
      </div>
    </div>
    <div class="rounded-2xl border border-line bg-raised/50 p-4 text-xs leading-relaxed text-muted"><strong class="text-ink">How it works:</strong> when you record a sale or expense without network, Ojaly stores it on this device only. When your connection returns, we send it to the server in order. Stock is validated at sync time, so an oversold item will show as “needs attention” instead of silently failing.</div>
  </div>
</template>
