<script setup lang="ts">
import { Mail, MessageCircle, Phone, Plus, Search, Users } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
import { prettyPhone, whatsappLink } from '~/utils/phone';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Customers' });
const toast = useToast();
const { items, meta, loading, saving, filters, load, create } = useCustomers();
const createOpen = ref(false);
const form = reactive({ name: '', phone: '', email: '', address: '', notes: '' });
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => filters.filter, () => { filters.page = 1; load(); });
async function save() {
  if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone are required.'); return; }
  try { await create(form); toast.success('Customer added.'); createOpen.value = false; Object.assign(form, { name: '', phone: '', email: '', address: '', notes: '' }); await load(); }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Customers" subtitle="The people who buy from you — and the money between you." eyebrow="Relationships">
      <template #actions><BaseButton @click="createOpen = true"><Plus class="h-4 w-4" /> Add customer</BaseButton></template>
    </PageHeader>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Customers</p><p class="mt-1 font-display text-2xl font-bold">{{ meta.total }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Owing</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ meta.owing }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Outstanding</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(meta.totalOutstandingKobo) }}</p></div>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="filters.search" type="search" placeholder="Search name, phone or tag…" class="input-base pl-11" aria-label="Search customers"></div>
      <BaseSelect v-model="filters.filter" :options="[{ value: 'all', label: 'Everyone' }, { value: 'owing', label: 'Owing' }, { value: 'paid', label: 'No balance' }]" aria-label="Filter" class="!w-40" />
    </div>
    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><div v-for="i in 6" :key="i" class="skeleton h-40 rounded-3xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No customers yet" message="Add a customer once. Every sale, debt and reminder follows them." action-label="Add your first customer" @action="createOpen = true"><template #icon><Users class="h-9 w-9" /></template></BaseEmptyState>
    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="customer in items" :key="customer.id" class="card p-4">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent font-bold text-forest-900">{{ customer.name.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</div>
          <div class="min-w-0 flex-1"><NuxtLink :to="`/app/customers/${customer.id}`" class="truncate font-bold hover:underline">{{ customer.name }}</NuxtLink><p class="text-[11px] text-muted">{{ prettyPhone(customer.phone) }}</p></div>
          <BaseBadge :variant="customer.outstandingKobo > 0 ? 'warning' : 'success'">{{ customer.outstandingKobo > 0 ? 'Owing' : 'Clear' }}</BaseBadge>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-raised/60 p-2.5 text-[11px]"><div><p class="text-muted">Spent</p><p class="font-bold">{{ formatNaira(customer.totalSpentKobo) }}</p></div><div><p class="text-muted">Owed</p><p class="font-bold" :class="customer.outstandingKobo ? 'text-warning' : ''">{{ formatNaira(customer.outstandingKobo) }}</p></div></div>
        <div class="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{{ customer.orderCount }} purchase{{ customer.orderCount === 1 ? '' : 's' }}</span><span>Last {{ customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : '—' }}</span></div>
        <div class="mt-3 flex gap-1 border-t border-line pt-2">
          <a :href="whatsappLink(customer.phone, `Hi ${customer.name.split(' ')[0]}, thanks for shopping with us!`)" target="_blank" rel="noopener" class="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-success hover:bg-raised"><MessageCircle class="h-3.5 w-3.5" /> WhatsApp</a>
          <a v-if="customer.email" :href="`mailto:${customer.email}`" class="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-muted hover:bg-raised"><Mail class="h-3.5 w-3.5" /> Email</a>
          <NuxtLink :to="`/app/customers/${customer.id}`" class="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-muted hover:bg-raised">History</NuxtLink>
        </div>
      </div>
    </div>
    <div v-if="meta.pages > 1" class="flex justify-center gap-2"><BaseButton size="sm" variant="outline" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton><span class="flex items-center text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span><BaseButton size="sm" variant="outline" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton></div>

    <BaseModal v-model:open="createOpen" title="Add a customer">
      <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.name" label="Name" required /><BaseInput v-model="form.phone" label="Phone" inputmode="tel" required /><BaseInput v-model="form.email" label="Email" type="email" /><BaseInput v-model="form.address" label="Address" /><div class="sm:col-span-2"><BaseTextarea v-model="form.notes" label="Notes" :rows="2" /></div></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="createOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="save">Save customer</BaseButton></div>
    </BaseModal>
  </div>
</template>
