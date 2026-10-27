import { debtsApi } from '~/api/factories/debtsApi';
import { paymentsApi } from '~/api/factories/paymentsApi';
import type { Debt } from '~/types';

export function useDebts() {
  const items = ref<Debt[]>([]);
  const meta = reactive({ total: 0, page: 1, limit: 20, pages: 0, totalOutstandingKobo: 0, overdueKobo: 0, overdueCount: 0 });
  const loading = ref(false);
  const saving = ref(false);
  const filters = reactive({ status: 'all', search: '', page: 1, limit: 20 });

  async function load() {
    loading.value = true;
    try { const result = await debtsApi.listDebts({ ...filters, search: filters.search || undefined }); items.value = result.items; Object.assign(meta, result.meta); }
    finally { loading.value = false; }
  }
  async function create(payload: Parameters<typeof debtsApi.createDebt>[0]) { saving.value = true; try { return await debtsApi.createDebt(payload); } finally { saving.value = false; } }
  async function pay(id: string, payload: { amountKobo: number; method?: string; note?: string }) { saving.value = true; try { const d = await debtsApi.recordPayment(id, payload); await load(); return d; } finally { saving.value = false; } }
  async function remind(id: string, channel: 'whatsapp' | 'email') { return debtsApi.remind(id, channel); }
  async function paymentLink(id: string, email?: string) { return paymentsApi.linkDebt(id, email); }
  return { items, meta, loading, saving, filters, load, create, pay, remind, paymentLink };
}
