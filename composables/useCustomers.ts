import { customersApi } from '~/api/factories/customersApi';
import type { Customer } from '~/types';

export function useCustomers() {
  const items = ref<Customer[]>([]);
  const detail = ref<Awaited<ReturnType<typeof customersApi.getCustomer>> | null>(null);
  const meta = reactive({ total: 0, page: 1, limit: 20, pages: 0, owing: 0, totalOutstandingKobo: 0 });
  const loading = ref(false);
  const saving = ref(false);
  const filters = reactive({ search: '', filter: 'all', page: 1, limit: 20 });

  async function load() {
    loading.value = true;
    try { const result = await customersApi.listCustomers(filters); items.value = result.items; Object.assign(meta, result.meta); }
    finally { loading.value = false; }
  }
  async function loadOne(id: string) { loading.value = true; try { detail.value = await customersApi.getCustomer(id); } finally { loading.value = false; } }
  async function create(payload: Parameters<typeof customersApi.createCustomer>[0]) { saving.value = true; try { return await customersApi.createCustomer(payload); } finally { saving.value = false; } }
  async function update(id: string, payload: Partial<Customer>) { saving.value = true; try { return await customersApi.updateCustomer(id, payload); } finally { saving.value = false; } }
  return { items, detail, meta, loading, saving, filters, load, loadOne, create, update };
}
