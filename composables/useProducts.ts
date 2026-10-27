import { productsApi } from '~/api/factories/productsApi';
import type { Product } from '~/types';

export function useProducts() {
  const items = ref<Product[]>([]);
  const meta = reactive({ total: 0, page: 1, limit: 20, pages: 0 });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const categories = ref<string[]>([]);
  const lowStock = ref<Awaited<ReturnType<typeof productsApi.lowStock>>>([]);
  const allProducts = ref<Product[]>([]);
  const loadingAll = ref(false);
  const filters = reactive({ search: '', category: 'all', status: 'all', page: 1, limit: 20 });

  async function load() {
    loading.value = true; error.value = null;
    try {
      const result = await productsApi.listProducts({
        page: filters.page, limit: filters.limit, search: filters.search || undefined,
        category: filters.category, status: filters.status,
      });
      items.value = result.items;
      Object.assign(meta, result.meta);
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function loadAll() {
    loadingAll.value = true;
    try { allProducts.value = (await productsApi.listProducts({ limit: 100, status: 'active' })).items; }
    finally { loadingAll.value = false; }
    return allProducts.value;
  }
  async function loadExtras() {
    try { [categories.value, lowStock.value] = await Promise.all([productsApi.categories(), productsApi.lowStock()]); }
    catch { /* keep page usable */ }
  }
  function setFilter(key: keyof typeof filters, value: string | number) {
    (filters[key] as string | number) = value;
    if (key !== 'page' && key !== 'limit') filters.page = 1;
    return load();
  }
  async function deactivate(id: string) { await productsApi.deactivate(id); await load(); }
  return { items, meta, loading, error, categories, lowStock, allProducts, loadingAll, filters, load, loadAll, loadExtras, setFilter, deactivate };
}
