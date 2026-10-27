<script setup lang="ts">
import { Image as ImageIcon, Pencil, Plus, ReceiptText, Search, Trash2 } from 'lucide-vue-next';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';
import { formatDate, todayInput } from '~/utils/date';
import { titleCase } from '~/utils/entities';
import type { Expense } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Expenses' });
const toast = useToast();
const { items, categories, meta, loading, saving, filters, load, create, update, remove } = useExpenses();
const modalOpen = ref(false);
const editId = ref<string | null>(null);
const confirmOpen = ref(false);
const deleteTarget = ref<Expense | null>(null);
const form = reactive({ category: 'stock_purchase', amount: '', date: todayInput(), notes: '', receiptUrl: '', recurrence: 'none', recurrenceEndsAt: '' });
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => [filters.category, filters.from, filters.to], () => { filters.page = 1; load(); });
function openCreate() { editId.value = null; Object.assign(form, { category: 'stock_purchase', amount: '', date: todayInput(), notes: '', receiptUrl: '', recurrence: 'none', recurrenceEndsAt: '' }); modalOpen.value = true; }
function openEdit(expense: Expense) {
  editId.value = expense.id;
  Object.assign(form, { category: expense.category, amount: nairaInput(expense.amountKobo), date: expense.date.slice(0, 10), notes: expense.notes, receiptUrl: expense.receiptUrl || '', recurrence: expense.recurrence, recurrenceEndsAt: expense.recurrenceEndsAt?.slice(0, 10) || '' });
  modalOpen.value = true;
}
async function save() {
  if (!form.amount || nairaToKobo(form.amount) <= 0) { toast.error('Enter the amount you spent.'); return; }
  const payload = { category: form.category, amountKobo: nairaToKobo(form.amount), date: form.date, notes: form.notes, receiptUrl: form.receiptUrl || undefined, recurrence: form.recurrence, recurrenceEndsAt: form.recurrence === 'none' ? undefined : form.recurrenceEndsAt || undefined };
  try {
    const result = editId.value ? await update(editId.value, payload) : await create(payload);
    if (!('queued' in (result as object))) toast.success(editId.value ? 'Expense updated.' : 'Expense recorded.');
    modalOpen.value = false; await load();
  } catch (error) { toast.error((error as Error).message); }
}
async function doDelete() {
  if (!deleteTarget.value) return;
  try { await remove(deleteTarget.value.id); toast.success('Expense removed.'); confirmOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(load);
</script>

<template>
  <div class="space-y-5" data-tour="expenses-page">
    <PageHeader title="Expenses" subtitle="Transport, data, packaging, rent — all the money that leaves before profit." eyebrow="Money out">
      <template #actions><BaseButton @click="openCreate"><Plus class="h-4 w-4" /> Add expense</BaseButton></template>
    </PageHeader>
    <div class="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Total in view</p><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(meta.totalAmountKobo) }}</p></div>
        <div class="card p-4"><p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">By category</p><ExpenseDonut :data="meta.byCategory" /></div>
      </div>
      <div class="space-y-3">
        <div class="flex flex-col gap-2 sm:flex-row">
          <div class="relative flex-1"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="filters.search" type="search" placeholder="Search notes…" class="input-base pl-11" aria-label="Search expenses"></div>
          <BaseSelect v-model="filters.category" :options="[{ value: 'all', label: 'All categories' }, ...categories.map((cat) => ({ value: cat.key, label: cat.label }))]" aria-label="Category" class="!w-40" />
          <BaseDatePicker v-model="filters.from" class="w-full sm:w-40" aria-label="From date" />
        </div>
        <BaseTable :loading="loading">
          <template #head><tr><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Expense</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Category</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Amount</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted"></th></tr></template>
          <template #body>
            <tr v-for="expense in items" :key="expense.id" class="border-b border-line last:border-0 hover:bg-raised/40">
              <td class="px-4 py-3"><p class="text-xs font-semibold">{{ expense.notes || titleCase(expense.category) }}</p><p class="text-[10px] text-muted">{{ formatDate(expense.date) }}<span v-if="expense.recurrence !== 'none'"> · repeats {{ expense.recurrence }}</span></p></td>
              <td class="px-4 py-3"><BaseBadge variant="neutral">{{ titleCase(expense.category) }}</BaseBadge></td>
              <td class="px-4 py-3 text-right text-xs font-bold">{{ formatNaira(expense.amountKobo) }}</td>
              <td class="px-4 py-3"><div class="flex justify-end gap-1"><a v-if="expense.receiptUrl" :href="expense.receiptUrl" target="_blank" class="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-raised" aria-label="Receipt"><ImageIcon class="h-3.5 w-3.5" /></a><button class="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-raised" aria-label="Edit" @click="openEdit(expense)"><Pencil class="h-3.5 w-3.5" /></button><button class="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/5" aria-label="Delete" @click="deleteTarget = expense; confirmOpen = true"><Trash2 class="h-3.5 w-3.5" /></button></div></td>
            </tr>
            <tr v-if="!items.length && !loading"><td colspan="4"><BaseEmptyState compact title="No expenses yet" message="Tracking small expenses is how you find your real profit." action-label="Add an expense" @action="openCreate"><template #icon><ReceiptText class="h-8 w-8" /></template></BaseEmptyState></td></tr>
          </template>
        </BaseTable>
        <div v-if="meta.pages > 1" class="flex justify-center gap-2"><BaseButton size="sm" variant="outline" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton><span class="flex items-center text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span><BaseButton size="sm" variant="outline" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton></div>
      </div>
    </div>

    <BaseModal v-model:open="modalOpen" :title="editId ? 'Edit expense' : 'Add an expense'" description="Small expenses add up. Record them and your profit becomes real.">
      <div class="grid gap-3 sm:grid-cols-2">
        <BaseSelect v-model="form.category" label="Category" :options="categories.map((c) => ({ value: c.key, label: c.label }))" />
        <BaseInput v-model="form.amount" label="Amount" prefix="₦" inputmode="decimal" required />
        <BaseDatePicker v-model="form.date" label="Date" :max="todayInput()" />
        <BaseSelect v-model="form.recurrence" label="Repeat" :options="[{ value: 'none', label: 'One time' }, { value: 'daily', label: 'Every day' }, { value: 'weekly', label: 'Every week' }, { value: 'monthly', label: 'Every month' }]" />
        <div class="sm:col-span-2"><BaseInput v-model="form.notes" label="What was it for?" placeholder="Bus to Yaba market" /></div>
        <BaseDatePicker v-if="form.recurrence !== 'none'" v-model="form.recurrenceEndsAt" label="Repeat until (optional)" class="sm:col-span-2" />
        <div class="sm:col-span-2"><ImageUploader v-model="form.receiptUrl" purpose="expenses" label="Receipt photo (optional)" aspect="video" /></div>
      </div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="modalOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="save">Save expense</BaseButton></div>
    </BaseModal>
    <ConfirmDialog v-model:open="confirmOpen" danger title="Delete this expense?" message="It will be removed from your profit calculations. This cannot be undone." confirm-label="Delete" @confirm="doDelete" />
  </div>
</template>
