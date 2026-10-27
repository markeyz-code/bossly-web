<script setup lang="ts">
import { CheckCircle2, Eye, MessageCircle, Plus, Search, ShoppingBag } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Orders' });
const toast = useToast();
const { items, meta, loading, filters, load, confirm } = useOrders();
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => filters.status, () => { filters.page = 1; load(); });
const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'> = { pending: 'warning', confirmed: 'info', paid: 'success', delivered: 'brand', cancelled: 'neutral' };
const statusTabs = computed(() => [
  { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending', count: meta.statusCounts.pending || 0 },
  { key: 'confirmed', label: 'Confirmed', count: meta.statusCounts.confirmed || 0 },
  { key: 'paid', label: 'Paid', count: meta.statusCounts.paid || 0 },
  { key: 'delivered', label: 'Delivered', count: meta.statusCounts.delivered || 0 },
  { key: 'cancelled', label: 'Cancelled', count: meta.statusCounts.cancelled || 0 },
]);
async function quickConfirm(id: string) {
  try { await confirm(id); toast.success('Order confirmed. Stock was reserved and a sale was created.'); }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(load);
</script>

<template>
  <div class="space-y-5" data-tour="orders-list">
    <PageHeader title="Orders" subtitle="WhatsApp, website and manual orders — nothing gets retyped." eyebrow="Fulfilment">
      <template #actions>
        <BaseButton to="/app/orders/paste" variant="outline"><MessageCircle class="h-4 w-4" /> Paste a chat</BaseButton>
        <BaseButton to="/app/orders/new"><Plus class="h-4 w-4" /> New order</BaseButton>
      </template>
    </PageHeader>

    <BaseTabs v-model="filters.status" :items="statusTabs" />

    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="filters.search" type="search" placeholder="Search order number, customer or phone…" class="input-base pl-11" aria-label="Search orders"></div>
      <BaseSelect v-model="filters.source" :options="[{ value: '', label: 'All sources' }, { value: 'storefront', label: 'Website' }, { value: 'whatsapp', label: 'WhatsApp bot' }, { value: 'paste_chat', label: 'Pasted chat' }, { value: 'manual', label: 'Manual' }, { value: 'embed', label: 'Embed widget' }]" aria-label="Source" class="!w-44" @change="load" />
    </div>

    <div v-if="loading" class="space-y-2"><div v-for="i in 4" :key="i" class="skeleton h-24 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No orders here" message="Orders from your website and WhatsApp will land here. You can also create one manually." action-label="Create an order" @action="navigateTo('/app/orders/new')">
      <template #icon><ShoppingBag class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="space-y-2">
      <div v-for="order in items" :key="order.id" class="card p-4">
        <div class="flex flex-wrap items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-raised text-xs font-bold">{{ order.customerName.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2"><p class="font-bold">{{ order.customerName }}</p><BaseBadge :variant="statusVariant[order.status]" dot>{{ order.status }}</BaseBadge><BaseBadge variant="neutral">{{ order.source === 'paste_chat' ? 'Pasted chat' : order.source }}</BaseBadge></div>
            <p class="mt-0.5 text-[11px] text-muted">{{ order.orderNumber }} · {{ formatDateTime(order.createdAt) }} · {{ order.items.reduce((s, i) => s + i.quantity, 0) }} item{{ order.items.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's' }}</p>
            <p class="mt-1 truncate text-xs text-muted">{{ order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') }}</p>
          </div>
          <div class="text-right"><p class="font-display text-xl font-bold">{{ formatNaira(order.totalKobo) }}</p><p class="text-[10px] text-muted">Paid {{ formatNaira(order.amountPaidKobo) }}</p></div>
          <div class="flex w-full items-center justify-end gap-1.5 sm:w-auto">
            <BaseButton v-if="order.status === 'pending'" size="sm" variant="outline" @click="quickConfirm(order.id)"><CheckCircle2 class="h-3.5 w-3.5" /> Confirm</BaseButton>
            <BaseButton :to="`/app/orders/${order.id}`" size="sm" variant="ghost"><Eye class="h-4 w-4" /> Open</BaseButton>
          </div>
        </div>
      </div>
    </div>
    <div v-if="meta.pages > 1" class="flex justify-center gap-2">
      <BaseButton size="sm" variant="outline" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton>
      <span class="flex items-center text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span>
      <BaseButton size="sm" variant="outline" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton>
    </div>
  </div>
</template>
