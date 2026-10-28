<script setup lang="ts">
import { AlertTriangle, ArrowUpRight, CheckCircle2, CreditCard, Mail, MessageCircle, Plus, Search, Wallet } from 'lucide-vue-next';
import { formatNaira, nairaToKobo } from '~/utils/money';
import { addDaysInput, formatDate, todayInput } from '~/utils/date';
import { whatsappLink } from '~/utils/phone';
import type { Debt } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Debts' });
const toast = useToast();
const { items, meta, loading, saving, filters, load, create, pay, remind, paymentLink } = useDebts();
const createOpen = ref(false);
const detailOpen = ref(false);
const paymentOpen = ref(false);
const selected = ref<Debt | null>(null);
const form = reactive({ customerName: '', customerPhone: '', customerEmail: '', amount: '', dueDate: addDaysInput(7), notes: '' });
const payment = reactive({ amount: '', method: 'cash', note: '' });
const link = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => filters.status, () => { filters.page = 1; load(); });
const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { paid: 'success', partial: 'warning', unpaid: 'warning', overdue: 'danger' };
function openDetail(debt: Debt) { selected.value = debt; detailOpen.value = true; link.value = null; }
async function createDebt() {
  if (!form.customerName || !form.customerPhone || !form.amount) { toast.error('Name, phone and amount are required.'); return; }
  try {
    await create({ customerName: form.customerName, customerPhone: form.customerPhone, customerEmail: form.customerEmail || undefined, amountKobo: nairaToKobo(form.amount), dueDate: form.dueDate, notes: form.notes });
    toast.success('Debt recorded.'); createOpen.value = false;
    Object.assign(form, { customerName: '', customerPhone: '', customerEmail: '', amount: '', dueDate: addDaysInput(7), notes: '' });
    await load();
  } catch (error) { toast.error((error as Error).message); }
}
function openPayment(debt: Debt) { selected.value = debt; payment.amount = String(debt.balanceKobo / 100); payment.method = 'cash'; payment.note = ''; paymentOpen.value = true; }
async function recordPayment() {
  if (!selected.value) return;
  try {
    const updated = await pay(selected.value.id, { amountKobo: nairaToKobo(payment.amount), method: payment.method, note: payment.note });
    selected.value = updated; paymentOpen.value = false; toast.success('Payment recorded. Balance updated.');
  } catch (error) { toast.error((error as Error).message); }
}
async function sendReminder(channel: 'whatsapp' | 'email') {
  if (!selected.value) return;
  try {
    const result = await remind(selected.value.id, channel);
    if (result.link) { window.open(result.link, '_blank'); toast.success('WhatsApp reminder ready to send.'); }
    else toast.success(result.sent ? 'Reminder email sent.' : 'Reminder recorded, but email is not configured.');
    await load();
  } catch (error) { toast.error((error as Error).message); }
}
function sharePaymentLink() {
  if (!selected.value?.customerPhone || !link.value) return;
  const message = `Hello ${selected.value.customerName.split(' ')[0]}, here is a secure payment link for your outstanding balance of ${formatNaira(selected.value.balanceKobo)}: ${link.value}`;
  window.open(whatsappLink(selected.value.customerPhone, message), '_blank');
}
async function createLink() {
  if (!selected.value) return;
  try { const result = await paymentLink(selected.value.id); link.value = result.authorizationUrl; await navigator.clipboard.writeText(result.authorizationUrl).catch(() => undefined); toast.success('Payment link copied.'); }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(load);
</script>

<template>
  <div class="space-y-5" data-tour="debts-list">
    <PageHeader title="Debts" subtitle="Who owes you, how much, and when it's due. No more memory tax." eyebrow="Money outside">
      <template #actions><BaseButton @click="createOpen = true"><Plus class="h-4 w-4" /> Record a debt</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Outstanding</p><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(meta.totalOutstandingKobo) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Overdue</p><p class="mt-1 font-display text-3xl font-bold text-danger">{{ formatNaira(meta.overdueKobo) }}</p><p class="text-[10px] text-muted">{{ meta.overdueCount }} debt{{ meta.overdueCount === 1 ? '' : 's' }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">In the ledger</p><p class="mt-1 font-display text-3xl font-bold">{{ meta.total }}</p></div>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="filters.search" type="search" placeholder="Search customer or phone…" class="input-base pl-11" aria-label="Search debts"></div>
      <BaseSelect v-model="filters.status" :options="[{ value: 'all', label: 'All debts' }, { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Part paid' }, { value: 'overdue', label: 'Overdue' }, { value: 'paid', label: 'Settled' }]" aria-label="Filter debts" class="!w-44" />
    </div>

    <div v-if="loading" class="space-y-2"><div v-for="i in 4" :key="i" class="skeleton h-24 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No debts on record" message="When a customer pays later, record it here. Ojaly keeps the running balance and reminds them for you." action-label="Record a debt" @action="createOpen = true">
      <template #icon><Wallet class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="space-y-2">
      <div v-for="debt in items" :key="debt.id" class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent font-bold text-forest-900">{{ debt.customerName.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</div>
          <div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><p class="font-bold">{{ debt.customerName }}</p><BaseBadge :variant="statusVariant[debt.displayStatus || debt.status]" dot>{{ debt.displayStatus || debt.status }}</BaseBadge><span v-if="debt.daysOverdue" class="text-[10px] font-bold text-danger">{{ debt.daysOverdue }}d overdue</span></div><p class="text-[11px] text-muted">{{ debt.customerPhone }} · due {{ formatDate(debt.dueDate) }}</p></div>
          <div class="text-right"><p class="font-display text-xl font-bold">{{ formatNaira(debt.balanceKobo) }}</p><p class="text-[10px] text-muted">of {{ formatNaira(debt.principalKobo) }}</p></div>
          <div class="flex w-full justify-end gap-1.5 sm:w-auto">
            <BaseButton v-if="debt.balanceKobo > 0" size="sm" variant="outline" @click="openPayment(debt)"><CreditCard class="h-3.5 w-3.5" /> Pay</BaseButton>
            <BaseButton size="sm" variant="ghost" @click="openDetail(debt)">Open</BaseButton>
          </div>
        </div>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-raised"><div class="h-full rounded-full bg-success" :style="{ width: `${debt.principalKobo ? Math.min(100, (debt.paidKobo / debt.principalKobo) * 100) : 0}%` }" /></div>
      </div>
    </div>
    <div v-if="meta.pages > 1" class="flex justify-center gap-2"><BaseButton size="sm" variant="outline" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton><span class="flex items-center text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span><BaseButton size="sm" variant="outline" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton></div>

    <BaseModal v-model:open="createOpen" title="Record a debt" description="For a customer paying later. We'll add it to their ledger.">
      <div class="grid gap-3 sm:grid-cols-2">
        <BaseInput v-model="form.customerName" label="Customer name" required /><BaseInput v-model="form.customerPhone" label="Phone number" inputmode="tel" required />
        <BaseInput v-model="form.customerEmail" label="Email (for reminders)" type="email" /><BaseInput v-model="form.amount" label="Amount owed" prefix="₦" inputmode="decimal" required />
        <BaseDatePicker v-model="form.dueDate" label="Due date" :min="todayInput()" /><BaseInput v-model="form.notes" label="Note" placeholder="What was it for?" />
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="createOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="createDebt">Save debt</BaseButton></div>
    </BaseModal>

    <BaseModal v-model:open="paymentOpen" title="Record a payment" :description="selected ? `${selected.customerName} · ${formatNaira(selected.balanceKobo)} outstanding` : ''">
      <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="payment.amount" label="Amount received" prefix="₦" inputmode="decimal" /><BaseSelect v-model="payment.method" label="Method" :options="[{ value: 'cash', label: 'Cash' }, { value: 'transfer', label: 'Transfer' }, { value: 'pos', label: 'POS' }, { value: 'paystack', label: 'Paystack' }, { value: 'other', label: 'Other' }]" /></div>
      <div class="mt-3"><BaseInput v-model="payment.note" label="Note (optional)" /></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="paymentOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="recordPayment">Save payment</BaseButton></div>
    </BaseModal>

    <BaseModal v-model:open="detailOpen" :title="selected?.customerName" :description="selected ? `Debt recorded ${formatDate(selected.createdAt)}` : ''" size="lg">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-raised/60 p-4"><div><p class="text-xs text-muted">Balance</p><p class="font-display text-3xl font-bold">{{ formatNaira(selected.balanceKobo) }}</p><p class="text-[11px] text-muted">Principal {{ formatNaira(selected.principalKobo) }} · paid {{ formatNaira(selected.paidKobo) }}</p></div><div class="text-right"><BaseBadge :variant="statusVariant[selected.displayStatus || selected.status]" dot>{{ selected.displayStatus || selected.status }}</BaseBadge><p class="mt-1 text-[11px] text-muted">Due {{ formatDate(selected.dueDate) }}</p></div></div>
        <div class="flex flex-wrap gap-2">
          <BaseButton v-if="selected.balanceKobo > 0" size="sm" variant="outline" @click="paymentOpen = true; detailOpen = false"><CreditCard class="h-4 w-4" /> Record payment</BaseButton>
          <BaseButton v-if="selected.balanceKobo > 0" size="sm" variant="outline" @click="sendReminder('whatsapp')"><MessageCircle class="h-4 w-4" /> WhatsApp reminder</BaseButton>
          <BaseButton v-if="selected.balanceKobo > 0" size="sm" variant="outline" @click="sendReminder('email')"><Mail class="h-4 w-4" /> Email reminder</BaseButton>
          <BaseButton v-if="selected.balanceKobo > 0" size="sm" variant="outline" @click="createLink"><ArrowUpRight class="h-4 w-4" /> Payment link</BaseButton>
        </div>
        <div v-if="link" class="rounded-xl border border-success/20 bg-success/5 p-3 text-xs"><p class="font-bold text-success">Paystack payment link</p><a :href="link" target="_blank" class="break-all underline">{{ link }}</a><button type="button" class="mt-2 flex items-center gap-1 text-[11px] font-bold text-success" @click="sharePaymentLink"><MessageCircle class="h-3.5 w-3.5" /> Send link on WhatsApp</button></div>
        <div>
          <h3 class="text-sm font-bold">Payment history</h3>
          <div v-if="selected.payments.length" class="mt-2 divide-y divide-line rounded-xl border border-line">
            <div v-for="p in [...selected.payments].reverse()" :key="p.paidAt" class="flex items-center justify-between px-3 py-2.5 text-xs"><div><p class="font-semibold">{{ formatNaira(p.amountKobo) }} · {{ p.method }}</p><p class="text-[10px] text-muted">{{ formatDate(p.paidAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) }}{{ p.note ? ` · ${p.note}` : '' }}</p></div><CheckCircle2 class="h-4 w-4 text-success" /></div>
          </div>
          <p v-else class="mt-2 text-xs text-muted">No payments yet.</p>
        </div>
        <p v-if="selected.notes" class="rounded-xl bg-raised/50 p-3 text-xs text-muted">{{ selected.notes }}</p>
      </div>
    </BaseModal>
  </div>
</template>
