<script setup lang="ts">
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info, PackageOpen, Trash2, Wallet } from 'lucide-vue-next';
import { timeAgo } from '~/utils/date';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Notifications' });
const toast = useToast();
const { items, unread, loading, fetchNotifications, markRead, markAllRead, remove } = useNotifications();
const icons: Record<string, unknown> = { low_stock: PackageOpen, sale: CheckCircle2, order: Bell, debt: Wallet, billing: AlertTriangle, storefront_message: Info };
const tones: Record<string, string> = { info: 'bg-forest-500/10 text-forest-600', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning', danger: 'bg-danger/10 text-danger' };
function hrefFor(notification: { type: string; data: Record<string, unknown> }) {
  if (notification.type === 'low_stock') return '/app/stock';
  if (notification.type === 'order') return notification.data.orderId ? `/app/orders/${notification.data.orderId}` : '/app/orders';
  if (notification.type === 'sale') return '/app/sales';
  if (notification.type === 'billing') return '/app/settings?tab=billing';
  if (notification.type === 'storefront_message') return '/app/settings?tab=whatsapp';
  return '/app';
}
async function readAll() { try { await markAllRead(); toast.success('All caught up.'); } catch (e) { toast.error((e as Error).message); } }
async function removeOne(id: string) { try { await remove(id); } catch (e) { toast.error((e as Error).message); } }
onMounted(() => fetchNotifications({ force: true }));
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Notifications" subtitle="Stock warnings, new orders, money owed and plan updates." eyebrow="Inbox">
      <template #actions><BaseButton v-if="unread" variant="outline" @click="readAll"><CheckCheck class="h-4 w-4" /> Mark all read</BaseButton></template>
    </PageHeader>
    <div v-if="loading && !items.length" class="space-y-2"><div v-for="i in 5" :key="i" class="skeleton h-20 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="All quiet" message="When stock runs low, an order lands or a customer owes you, you'll see it here."><template #icon><Bell class="h-9 w-9" /></template></BaseEmptyState>
    <div v-else class="space-y-2">
      <div v-for="notification in items" :key="notification.id" class="card flex gap-3 p-4" :class="!notification.readAt ? 'border-l-4 border-l-brand-500' : ''">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="tones[notification.tone]"><component :is="icons[notification.type] || Bell" class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2"><p class="text-sm font-bold">{{ notification.title }}</p><span v-if="!notification.readAt" class="h-1.5 w-1.5 rounded-full bg-brand-500" /></div>
          <p class="mt-0.5 text-xs leading-relaxed text-muted">{{ notification.message }}</p>
          <div class="mt-2 flex items-center gap-3 text-[10px] font-semibold"><span class="text-muted">{{ timeAgo(notification.createdAt) }}</span><NuxtLink :to="hrefFor(notification)" class="text-brand-600 dark:text-brand-300" @click="markRead(notification.id)">Open</NuxtLink><button v-if="!notification.readAt" class="text-muted hover:text-ink" @click="markRead(notification.id)">Mark read</button></div>
        </div>
        <button class="h-fit text-muted hover:text-danger" aria-label="Delete notification" @click="removeOne(notification.id)"><Trash2 class="h-4 w-4" /></button>
      </div>
    </div>
  </div>
</template>
