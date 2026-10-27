import { stockApi } from '~/api/factories/stockApi';

export function useStock() {
  const summary = ref<Awaited<ReturnType<typeof stockApi.summary>> | null>(null);
  const movements = ref<Awaited<ReturnType<typeof stockApi.movements>>['items']>([]);
  const meta = reactive({ total: 0, page: 1, limit: 30, pages: 0, inbound: 0, outbound: 0 });
  const loading = ref(false);
  const saving = ref(false);
  const filters = reactive({ page: 1, limit: 30, type: '', productId: '' });

  async function load() {
    loading.value = true;
    try {
      const [s, m] = await Promise.all([
        stockApi.summary(),
        stockApi.movements({ page: filters.page, limit: filters.limit, type: filters.type || undefined, productId: filters.productId || undefined }),
      ]);
      summary.value = s; movements.value = m.items; Object.assign(meta, m.meta);
    } finally { loading.value = false; }
  }
  async function restock(productId: string, payload: { variantId: string; quantity: number; unitCostKobo?: number; note?: string }) {
    saving.value = true;
    try { return await stockApi.restock(productId, payload); }
    finally { saving.value = false; }
  }
  async function adjust(productId: string, payload: { variantId: string; delta: number; note: string }) {
    saving.value = true;
    try { return await stockApi.adjust(productId, payload); }
    finally { saving.value = false; }
  }
  return { summary, movements, meta, loading, saving, filters, load, restock, adjust };
}
