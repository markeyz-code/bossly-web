import { salesApi } from '~/api/factories/salesApi';
import { receiptsApi } from '~/api/factories/receiptsApi';
import { useOfflineQueue } from './useOfflineQueue';
import { isNetworkError } from '~/utils/errors';
import type { Sale } from '~/types';
import type { SalePayload } from '~/api/types';

export function useSales() {
  const items = ref<Sale[]>([]);
  const meta = reactive({ total: 0, page: 1, limit: 20, pages: 0, revenueKobo: 0, profitKobo: 0 });
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const filters = reactive({ period: 'month', search: '', paymentStatus: '', page: 1, limit: 20 });
  const offline = useOfflineQueue();

  async function load() {
    loading.value = true; error.value = null;
    try {
      const result = await salesApi.listSales({ ...filters, search: filters.search || undefined, paymentStatus: filters.paymentStatus || undefined });
      items.value = result.items; Object.assign(meta, result.meta);
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function create(payload: SalePayload) {
    saving.value = true;
    try {
      if (import.meta.client && !navigator.onLine) {
        offline.queueSale(payload as unknown as Record<string, unknown>);
        return { queued: true } as { queued: true };
      }
      return await salesApi.createSale(payload);
    } catch (err) {
      if (isNetworkError(err)) {
        offline.queueSale(payload as unknown as Record<string, unknown>);
        return { queued: true } as { queued: true };
      }
      throw err;
    } finally { saving.value = false; }
  }
  async function voidSale(id: string, reason: string) { await salesApi.voidSale(id, reason); await load(); }
  async function resendReceipt(id: string) { return salesApi.resendReceipt(id); }
  async function getReceipt(receiptId: string) { return receiptsApi.getReceipt(receiptId); }
  return { items, meta, loading, saving, error, filters, load, create, voidSale, resendReceipt, getReceipt };
}
