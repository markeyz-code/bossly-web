<script setup lang="ts">
import { ArrowLeft, Mail, MessageCircle, Pencil, Phone, Wallet } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
import { prettyPhone, whatsappLink } from '~/utils/phone';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Customer' });
const route = useRoute();
const toast = useToast();
const { detail, loading, saving, loadOne, update } = useCustomers();
const editOpen = ref(false);
const form = reactive({ name: '', phone: '', email: '', address: '', notes: '' });
const id = computed(() => String(route.params.id));
function openEdit() {
  if (!detail.value) return;
  Object.assign(form, { name: detail.value.customer.name, phone: detail.value.customer.phone, email: detail.value.customer.email || '', address: detail.value.customer.address || '', notes: detail.value.customer.notes || '' });
  editOpen.value = true;
}
async function save() {
  try { await update(id.value, form); toast.success('Customer updated.'); editOpen.value = false; await loadOne(id.value); }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(() => loadOne(id.value));
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5">
    <div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><NuxtLink to="/app/customers" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">Customer</p><h1 class="font-display text-3xl font-bold">{{ detail?.customer.name || 'Loading…' }}</h1></div></div><BaseButton v-if="detail" size="sm" variant="outline" @click="openEdit"><Pencil class="h-3.5 w-3.5" /> Edit</BaseButton></div>
    <div v-if="loading" class="skeleton h-64 rounded-3xl" />
    <template v-else-if="detail">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Total spent</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(detail.customer.totalSpentKobo) }}</p></div>
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Outstanding</p><p class="mt-1 font-display text-2xl font-bold" :class="detail.customer.outstandingKobo > 0 ? 'text-warning' : 'text-success'">{{ formatNaira(detail.customer.outstandingKobo) }}</p></div>
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Purchases</p><p class="mt-1 font-display text-2xl font-bold">{{ detail.customer.orderCount }}</p></div>
      </div>
      <BaseCard>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-display text-xl font-bold text-forest-900">{{ detail.customer.name.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</div>
          <div class="min-w-0 flex-1"><p class="font-bold">{{ detail.customer.name }}</p><p class="text-xs text-muted">{{ prettyPhone(detail.customer.phone) }}{{ detail.customer.email ? ` · ${detail.customer.email}` : '' }}</p><p v-if="detail.customer.address" class="text-xs text-muted">{{ detail.customer.address }}</p></div>
          <div class="flex gap-1"><a :href="whatsappLink(detail.customer.phone, `Hi ${detail.customer.name.split(' ')[0]}!`)" target="_blank" rel="noopener" class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#128C4A]"><MessageCircle class="h-4 w-4" /></a><a v-if="detail.customer.email" :href="`mailto:${detail.customer.email}`" class="flex h-10 w-10 items-center justify-center rounded-xl bg-raised text-muted"><Mail class="h-4 w-4" /></a><a :href="`tel:${detail.customer.phone}`" class="flex h-10 w-10 items-center justify-center rounded-xl bg-raised text-muted"><Phone class="h-4 w-4" /></a></div>
        </div>
        <p v-if="detail.customer.notes" class="mt-3 rounded-xl bg-raised/50 p-3 text-xs text-muted">{{ detail.customer.notes }}</p>
      </BaseCard>
      <div class="grid gap-4 lg:grid-cols-2">
        <BaseCard><div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Purchases</h2><Wallet class="h-4 w-4 text-muted" /></div><div v-if="detail.sales.length" class="mt-3 divide-y divide-line"><div v-for="sale in detail.sales" :key="sale.id" class="flex items-center justify-between py-3 text-xs"><div><p class="font-semibold">{{ sale.saleNumber }}</p><p class="text-[10px] text-muted">{{ formatDate(sale.soldAt) }} · {{ sale.items.reduce((s, i) => s + i.quantity, 0) }} items</p></div><div class="text-right"><p class="font-bold">{{ formatNaira(sale.totalKobo) }}</p><BaseBadge :variant="sale.paymentStatus === 'paid' ? 'success' : 'warning'">{{ sale.paymentStatus }}</BaseBadge></div></div></div><p v-else class="mt-3 text-xs text-muted">No purchases yet.</p></BaseCard>
        <BaseCard><h2 class="font-display text-lg font-bold">Debt history</h2><div v-if="detail.debts.length" class="mt-3 divide-y divide-line"><div v-for="debt in detail.debts" :key="debt.id" class="flex items-center justify-between py-3 text-xs"><div><p class="font-semibold">{{ formatNaira(debt.principalKobo) }}</p><p class="text-[10px] text-muted">Due {{ formatDate(debt.dueDate) }}</p></div><div class="text-right"><p class="font-bold">{{ formatNaira(debt.balanceKobo) }} left</p><BaseBadge :variant="debt.balanceKobo <= 0 ? 'success' : 'warning'">{{ debt.balanceKobo <= 0 ? 'settled' : debt.status }}</BaseBadge></div></div></div><p v-else class="mt-3 text-xs text-muted">No debts on record.</p></BaseCard>
      </div>
    </template>
    <BaseModal v-model:open="editOpen" title="Edit customer">
      <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.name" label="Name" /><BaseInput v-model="form.phone" label="Phone" /><BaseInput v-model="form.email" label="Email" /><BaseInput v-model="form.address" label="Address" /><div class="sm:col-span-2"><BaseTextarea v-model="form.notes" label="Notes" :rows="2" /></div></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="editOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="save">Save changes</BaseButton></div>
    </BaseModal>
  </div>
</template>
