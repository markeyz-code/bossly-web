import { expensesApi } from '~/api/factories/expensesApi';
import { useOfflineQueue } from './useOfflineQueue';
import { isNetworkError } from '~/utils/errors';
import type { Expense } from '~/types';

export function useExpenses() {
  const items = ref<Expense[]>([]);
  const categories = ref<{ key: string; label: string }[]>([]);
  const meta = reactive({ total: 0, page: 1, limit: 20, pages: 0, totalAmountKobo: 0, byCategory: [] as { category: string; totalKobo: number; count: number }[] });
  const loading = ref(false);
  const saving = ref(false);
  const filters = reactive({ category: 'all', search: '', from: '', to: '', page: 1, limit: 20 });
  const offline = useOfflineQueue();

  async function load() {
    loading.value = true;
    try {
      const result = await expensesApi.listExpenses({ ...filters, search: filters.search || undefined, from: filters.from || undefined, to: filters.to || undefined });
      items.value = result.items; categories.value = result.categories; Object.assign(meta, result.meta);
    } finally { loading.value = false; }
  }
  async function create(payload: Parameters<typeof expensesApi.createExpense>[0]) {
    saving.value = true;
    try {
      if (import.meta.client && !navigator.onLine) { offline.queueExpense(payload as unknown as Record<string, unknown>); return { queued: true }; }
      return await expensesApi.createExpense(payload);
    } catch (err) {
      if (isNetworkError(err)) { offline.queueExpense(payload as unknown as Record<string, unknown>); return { queued: true }; }
      throw err;
    } finally { saving.value = false; }
  }
  async function update(id: string, payload: Record<string, unknown>) { saving.value = true; try { return await expensesApi.updateExpense(id, payload); } finally { saving.value = false; } }
  async function remove(id: string) { await expensesApi.removeExpense(id); await load(); }
  return { items, categories, meta, loading, saving, filters, load, create, update, remove };
}
