import { ordersApi } from '~/api/factories/ordersApi';
import { paymentsApi } from '~/api/factories/paymentsApi';
import type { Order } from '~/types';
import type { OrderPayload } from '~/api/types';

export function useOrders() {
  const items = ref<Order[]>([]);
  const meta = reactive({ total: 0, page: 1, limit: 20, pages: 0, statusCounts: {} as Record<string, number> });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = reactive({ status: 'all', source: '', search: '', page: 1, limit: 20 });

  async function load() {
    loading.value = true; error.value = null;
    try {
      const result = await ordersApi.listOrders({ ...filters, search: filters.search || undefined, source: filters.source || undefined });
      items.value = result.items; Object.assign(meta, result.meta);
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function create(payload: OrderPayload) { return ordersApi.createOrder(payload); }
  async function getOrder(id: string) { return ordersApi.getOrder(id); }
  async function linkPayment(id: string, email?: string) { return paymentsApi.linkOrder(id, email); }
  async function confirm(id: string) { await ordersApi.confirm(id); return load(); }
  async function pay(id: string, amountKobo: number, method = 'cash') { await ordersApi.recordPayment(id, { amountKobo, method }); return load(); }
  async function deliver(id: string) { await ordersApi.deliver(id); return load(); }
  async function cancel(id: string, reason?: string) { await ordersApi.cancel(id, reason); return load(); }
  return { items, meta, loading, error, filters, load, create, getOrder, linkPayment, confirm, pay, deliver, cancel };
}
