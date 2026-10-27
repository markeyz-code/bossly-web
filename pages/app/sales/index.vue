<script setup lang="ts">
import { ArrowRight, Download, ExternalLink, Eye, MessageCircle, Plus, ReceiptText, RotateCcw, Search, Send, Sparkles } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
import { whatsappLink } from '~/utils/phone';
import type { Sale } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Sales' });
const auth = useAuthStore();
const toast = useToast();
const { items, meta, loading, filters, load, voidSale, resendReceipt, getReceipt } = useSales();
const detail = ref<Sale | null>(null);
const detailOpen = ref(false);
const voidOpen = ref(false);
const voidReason = ref('');
const receiptLoading = ref(false);
const receiptToken = ref('');
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => [filters.period, filters.paymentStatus], () => { filters.page = 1; load(); });
function openDetail(sale: Sale) { detail.value = sale; detailOpen.value = true; receiptToken.value = ''; }
async function loadReceipt() {
  if (!detail.value?.receiptId) return;
  receiptLoading.value = true;
  try { const receipt = await getReceipt(detail.value.receiptId); receiptToken.value = receipt.publicToken; }
  catch (error) { toast.error((error as Error).message); }
  finally { receiptLoading.value = false; }
}
async function shareReceipt() {
  if (!detail.value?.customerPhone) { toast.error('This customer has no phone number.'); return; }
  if (!receiptToken.value) await loadReceipt();
  if (!receiptToken.value) { toast.error('No receipt is available for this sale.'); return; }
  const url = `${window.location.origin}/receipt/${receiptToken.value}`;
  const message = `Hello ${detail.value.customerName.split(' ')[0]}, here is your receipt from us: ${url}`;
  window.open(whatsappLink(detail.value.customerPhone, message), '_blank');
}
async function resend() {
  if (!detail.value) return;
  try { const result = await resendReceipt(detail.value.id); receiptToken.value = result.receiptToken; toast.success(result.sent ? 'Receipt re-sent by email.' : 'Receipt ready to share. Customer has no email.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function doVoid() {
  if (!detail.value) return;
  try { await voidSale(detail.value.id, voidReason.value || 'Voided by owner'); toast.success('Sale reversed and stock restored.'); voidOpen.value = false; detailOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
}
const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = { paid: 'success', partial: 'warning', unpaid: 'danger' };
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Sales" subtitle="Every sale, the cost inside it and what you actually made." eyebrow="Money in">
      <template #actions><BaseButton to="/app/sales/new"><Plus class="h-4 w-4" /> Record sale</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Revenue in view</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(meta.revenueKobo) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Gross profit</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ formatNaira(meta.profitKobo) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Sales recorded</p><p class="mt-1 font-display text-2xl font-bold">{{ meta.total }}</p></div>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="filters.search" type="search" placeholder="Search sale number or customer…" class="input-base pl-11" aria-label="Search sales"></div>
      <BaseSelect v-model="filters.period" :options="[{ value: 'today', label: 'Today' }, { value: 'week', label: 'This week' }, { value: 'month', label: 'This month' }, { value: 'all', label: 'All time' }]" aria-label="Period" class="!w-40" />
      <BaseSelect v-model="filters.paymentStatus" :options="[{ value: '', label: 'All payments' }, { value: 'paid', label: 'Paid' }, { value: 'partial', label: 'Part paid' }, { value: 'unpaid', label: 'Unpaid' }]" aria-label="Payment status" class="!w-40" />
      <BaseButton to="/app/sales/invoices" variant="outline"><ReceiptText class="h-4 w-4" /> Invoices</BaseButton>
    </div>

    <BaseTable :loading="loading">
      <template #head><tr><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Sale</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Customer</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Total</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Profit</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Payment</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted"></th></tr></template>
      <template #body>
        <tr v-for="sale in items" :key="sale.id" class="border-b border-line last:border-0 hover:bg-raised/40">
          <td class="px-4 py-3"><p class="text-xs font-bold">{{ sale.saleNumber }}</p><p class="text-[10px] text-muted">{{ formatDateTime(sale.soldAt) }} · {{ sale.items.length }} line{{ sale.items.length === 1 ? '' : 's' }}</p></td>
          <td class="px-4 py-3"><p class="text-xs font-semibold">{{ sale.customerName }}</p><p class="text-[10px] text-muted">{{ sale.customerPhone || 'Walk-in' }}</p></td>
          <td class="px-4 py-3 text-right text-xs font-bold">{{ formatNaira(sale.totalKobo) }}</td>
          <td class="px-4 py-3 text-right text-xs font-bold" :class="sale.grossProfitKobo >= 0 ? 'text-success' : 'text-danger'">{{ formatNaira(sale.grossProfitKobo) }}</td>
          <td class="px-4 py-3"><BaseBadge :variant="statusVariant[sale.paymentStatus]" dot>{{ sale.paymentStatus }}</BaseBadge></td>
          <td class="px-4 py-3 text-right"><button class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10" @click="openDetail(sale)"><Eye class="h-3.5 w-3.5" /> View</button></td>
        </tr>
        <tr v-if="!items.length && !loading"><td colspan="6"><BaseEmptyState compact title="No sales here yet" message="Record a sale, or adjust the filter to see older sales." action-label="Record a sale" @action="navigateTo('/app/sales/new')" /></td></tr>
      </template>
    </BaseTable>
    <div v-if="meta.pages > 1" class="flex justify-center gap-2">
      <BaseButton size="sm" variant="outline" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton>
      <span class="flex items-center text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span>
      <BaseButton size="sm" variant="outline" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton>
    </div>

    <BaseModal v-model:open="detailOpen" :title="detail?.saleNumber" :description="detail ? formatDateTime(detail.soldAt) : ''" size="lg">
      <div v-if="detail" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-raised/60 p-4">
          <div><p class="text-xs text-muted">Customer</p><p class="font-bold">{{ detail.customerName }}</p><p class="text-xs text-muted">{{ detail.customerPhone }}</p></div>
          <div class="text-right"><p class="text-xs text-muted">Total</p><p class="font-display text-2xl font-bold">{{ formatNaira(detail.totalKobo) }}</p><BaseBadge :variant="statusVariant[detail.paymentStatus]" dot>{{ detail.paymentStatus }}</BaseBadge></div>
        </div>
        <div class="divide-y divide-line rounded-2xl border border-line">
          <div v-for="item in detail.items" :key="item.productId + item.variantId" class="flex items-center justify-between gap-3 px-4 py-3 text-sm"><div><p class="font-semibold">{{ item.quantity }} × {{ item.name }}</p><p class="text-[10px] text-muted">{{ item.variantName }} · {{ formatNaira(item.unitPriceKobo) }} each</p></div><p class="font-bold">{{ formatNaira(item.lineTotalKobo) }}</p></div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div class="rounded-xl bg-raised/60 p-3"><p class="text-muted">Cost of goods</p><p class="mt-1 font-bold">{{ formatNaira(detail.costKobo) }}</p></div>
          <div class="rounded-xl bg-raised/60 p-3"><p class="text-muted">Gross profit</p><p class="mt-1 font-bold text-success">{{ formatNaira(detail.grossProfitKobo) }}</p></div>
          <div class="rounded-xl bg-raised/60 p-3"><p class="text-muted">Paid</p><p class="mt-1 font-bold">{{ formatNaira(detail.amountPaidKobo) }}</p></div>
          <div class="rounded-xl bg-raised/60 p-3"><p class="text-muted">Method</p><p class="mt-1 font-bold capitalize">{{ detail.paymentMethod }}</p></div>
        </div>
        <p v-if="detail.notes" class="rounded-xl bg-raised/50 p-3 text-xs text-muted">{{ detail.notes }}</p>
        <div v-if="receiptToken" class="rounded-xl border border-success/20 bg-success/5 p-3 text-xs"><p class="font-bold text-success">Receipt ready</p><a :href="`/receipt/${receiptToken}`" target="_blank" class="mt-1 inline-flex items-center gap-1 font-semibold underline">Open receipt <ExternalLink class="h-3 w-3" /></a></div>
        <div class="flex flex-wrap gap-2">
          <BaseButton v-if="detail.receiptId" size="sm" variant="outline" :loading="receiptLoading" @click="loadReceipt">Open receipt</BaseButton>
          <BaseButton size="sm" variant="outline" @click="resend"><Send class="h-4 w-4" /> Resend receipt</BaseButton><BaseButton size="sm" variant="outline" @click="shareReceipt"><MessageCircle class="h-4 w-4" /> Share on WhatsApp</BaseButton>
          <BaseButton v-if="auth.isOwner && !detail.orderId" size="sm" variant="danger" @click="voidOpen = true"><RotateCcw class="h-4 w-4" /> Void sale</BaseButton>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-model:open="voidOpen" title="Void this sale?" description="Stock will be restored, the debt record removed and the sale taken out of your reports. This cannot be undone.">
      <BaseTextarea v-model="voidReason" label="Reason" placeholder="Recorded twice by mistake" />
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="voidOpen = false">Keep sale</BaseButton><BaseButton variant="danger" @click="doVoid">Void sale</BaseButton></div>
    </BaseModal>
  </div>
</template>
