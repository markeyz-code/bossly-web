<script setup lang="ts">
import { BarChart3, CalendarRange, Download, FileSpreadsheet, Lock, Sparkles, TrendingUp } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { titleCase } from '~/utils/entities';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Reports' });
const route = useRoute();
const toast = useToast();
const dashboard = useDashboard();
const customOpen = ref(false);
const exportOpen = ref(false);
const ranges = [{ key: 'today', label: 'Today' }, { key: 'week', label: 'This week' }, { key: 'month', label: 'This month' }, { key: 'last_month', label: 'Last month' }, { key: 'custom', label: 'Custom' }];
const welcome = computed(() => route.query.welcome === '1');
async function choose(key: string) { if (key === 'custom') { customOpen.value = true; return; } await dashboard.load(key); }
async function applyCustom() { if (!dashboard.customFrom.value || !dashboard.customTo.value) { toast.error('Choose both dates.'); return; } customOpen.value = false; await dashboard.load('custom'); }
async function download(kind: 'csv' | 'pdf') {
  if (kind === 'csv' && !dashboard.data.value?.capabilities.csvExport) { toast.warning('CSV export is included in Hustle. Upgrade to unlock.', 'Plan feature'); return; }
  if (kind === 'pdf' && !dashboard.data.value?.capabilities.pdfExport) { toast.warning('PDF export is included in Hustle. Upgrade to unlock.', 'Plan feature'); return; }
  try { if (kind === 'csv') await dashboard.exportCsv(); else await dashboard.exportPdf(); toast.success('Report downloading.'); exportOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(() => dashboard.load('month'));
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Reports" subtitle="The whole truth: money in, cost out, expenses, profit and what is still owed." eyebrow="Your numbers">
      <template #actions>
        <div class="relative">
          <BaseButton variant="outline" @click="exportOpen = !exportOpen"><Download class="h-4 w-4" /> Export report</BaseButton>
          <div v-if="exportOpen" class="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-lift">
            <button class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-raised" @click="download('csv')"><FileSpreadsheet class="h-4 w-4 text-success" /> CSV <Lock v-if="!dashboard.data.value?.capabilities.csvExport" class="ml-auto h-3 w-3 text-muted" /></button>
            <button class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-raised" @click="download('pdf')"><Download class="h-4 w-4 text-brand-500" /> PDF <Lock v-if="!dashboard.data.value?.capabilities.pdfExport" class="ml-auto h-3 w-3 text-muted" /></button>
          </div>
        </div>
      </template>
    </PageHeader>

    <div v-if="welcome" class="rounded-3xl border-2 border-ink bg-accent p-5 text-forest-900 shadow-[5px_5px_0_0_#06231A]">
      <p class="flex items-center gap-2 font-display text-xl font-bold"><Sparkles class="h-5 w-5" /> This is your first profit number.</p>
      <p class="mt-1 text-sm font-medium">It is revenue, minus what the goods cost you, minus expenses. No vibes. Just the truth. Keep recording and it gets sharper.</p>
    </div>

    <div class="scrollbar-none flex gap-1.5 overflow-x-auto">
      <button v-for="range in ranges" :key="range.key" type="button" class="shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold" :class="dashboard.range.value === range.key ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted hover:text-ink'" @click="choose(range.key)"><CalendarRange v-if="range.key === 'custom'" class="mr-1 inline h-3.5 w-3.5" />{{ range.label }}</button>
    </div>

    <div v-if="dashboard.loading.value && !dashboard.data.value" class="space-y-4"><div class="grid gap-4 sm:grid-cols-4"><div v-for="i in 4" :key="i" class="skeleton h-32 rounded-3xl" /></div><div class="skeleton h-72 rounded-3xl" /></div>
    <template v-else-if="dashboard.data.value">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-tour="reports-summary">
        <StatCard label="Revenue" :value="dashboard.data.value.summary.revenueKobo" :change="dashboard.data.value.summary.comparison.revenuePercent" :hint="dashboard.data.value.range.human" />
        <StatCard label="Net profit" :value="dashboard.data.value.summary.profitKobo" :change="dashboard.data.value.summary.comparison.profitPercent" :hint="`${dashboard.data.value.summary.profitMargin}% margin`" />
        <StatCard label="Cost of goods" :value="dashboard.data.value.summary.cogsKobo" :hint="`${dashboard.data.value.summary.salesCount} sales`" />
        <StatCard label="Expenses" :value="dashboard.data.value.summary.expensesKobo" :change="dashboard.data.value.summary.comparison.expensesPercent" />
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <BaseCard><div class="flex items-center justify-between"><div><h2 class="font-display text-xl font-bold">Revenue vs profit</h2><p class="text-[11px] text-muted">Daily movement in this period.</p></div><TrendingUp class="h-5 w-5 text-success" /></div><RevenueChart :data="dashboard.data.value.chart" class="mt-4" /></BaseCard>
        <BaseCard><div class="flex items-center justify-between"><h2 class="font-display text-xl font-bold">Where money went</h2><BarChart3 class="h-4 w-4 text-muted" /></div><ExpenseDonut :data="dashboard.data.value.expensesByCategory" class="mt-4" /><div class="mt-4 rounded-xl bg-raised/60 p-3 text-xs"><p class="font-bold">Profit margin</p><p class="mt-0.5 text-muted">For every ₦100 you sold, you kept <strong class="text-ink">₦{{ dashboard.data.value.summary.profitMargin }}</strong>.</p></div></BaseCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <BaseCard><h2 class="font-display text-lg font-bold">Best sellers</h2><div v-if="dashboard.data.value.bestSellers.length" class="mt-3 space-y-3"><div v-for="(item, index) in dashboard.data.value.bestSellers" :key="item.productId" class="flex items-center gap-2.5"><span class="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-[10px] font-bold">{{ index + 1 }}</span><div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">{{ item.name }}</p><p class="text-[10px] text-muted">{{ item.quantity }} sold · {{ formatNaira(item.revenueKobo) }}</p></div><span class="text-[10px] font-bold text-success">{{ formatNaira(item.profitKobo) }}</span></div></div><p v-else class="mt-3 text-xs text-muted">No sales in this period.</p></BaseCard>
        <BaseCard><h2 class="font-display text-lg font-bold">Slow movers</h2><div v-if="dashboard.data.value.slowMovers.length" class="mt-3 space-y-3"><div v-for="item in dashboard.data.value.slowMovers.slice(0, 5)" :key="item.productId" class="flex items-center justify-between gap-2"><p class="min-w-0 truncate text-xs font-semibold">{{ item.name }}</p><span class="shrink-0 text-[10px] text-muted">{{ item.unitsSold }} sold · {{ item.stock }} left</span></div></div><p v-else class="mt-3 text-xs text-muted">Add products to see this.</p></BaseCard>
        <BaseCard><h2 class="font-display text-lg font-bold">Balance sheet, simplified</h2><dl class="mt-3 space-y-2.5 text-xs"><div class="flex justify-between"><dt class="text-muted">Stock at cost</dt><dd class="font-bold">{{ formatNaira(dashboard.data.value.stock.costValueKobo) }}</dd></div><div class="flex justify-between"><dt class="text-muted">Stock at retail</dt><dd class="font-bold">{{ formatNaira(dashboard.data.value.stock.retailValueKobo) }}</dd></div><div class="flex justify-between"><dt class="text-muted">Money owed to you</dt><dd class="font-bold text-warning">{{ formatNaira(dashboard.data.value.debts.outstandingKobo) }}</dd></div><div class="flex justify-between border-t border-line pt-2.5"><dt class="font-bold">Potential tied up</dt><dd class="font-bold">{{ formatNaira(dashboard.data.value.stock.costValueKobo + dashboard.data.value.debts.outstandingKobo) }}</dd></div></dl></BaseCard>
      </div>

      <BaseCard>
        <h2 class="font-display text-xl font-bold">What happened, in plain language</h2>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <div v-for="(insight, index) in dashboard.data.value.insights" :key="index" class="flex gap-2.5 rounded-xl bg-raised/50 p-3 text-xs leading-relaxed"><Sparkles class="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" /><span>{{ insight }}</span></div>
        </div>
      </BaseCard>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Gross profit</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(dashboard.data.value.summary.grossProfitKobo) }}</p><p class="mt-1 text-[10px] text-muted">Revenue minus cost of goods</p></div>
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Expenses</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(dashboard.data.value.summary.expensesKobo) }}</p><p class="mt-1 text-[10px] text-muted">Your recorded business costs</p></div>
        <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Net profit</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ formatNaira(dashboard.data.value.summary.profitKobo) }}</p><p class="mt-1 text-[10px] text-muted">What you actually made</p></div>
      </div>
    </template>

    <BaseModal v-model:open="customOpen" title="Custom report range">
      <div class="grid gap-3 sm:grid-cols-2"><BaseDatePicker v-model="dashboard.customFrom.value" label="From" /><BaseDatePicker v-model="dashboard.customTo.value" label="To" /></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="customOpen = false">Cancel</BaseButton><BaseButton @click="applyCustom">Apply</BaseButton></div>
    </BaseModal>
  </div>
</template>
