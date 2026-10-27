import { productsApi } from '~/api/factories/productsApi';
import type { Product } from '~/types';
import type { ProductPayload } from '~/api/types';

export function useProduct(id?: string) {
  const product = ref<Product | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function load(productId = id) {
    if (!productId) return;
    loading.value = true; error.value = null;
    try { product.value = await productsApi.get<Product>(productId); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function create(payload: ProductPayload) {
    saving.value = true;
    try { return await productsApi.createProduct(payload); }
    finally { saving.value = false; }
  }
  async function update(productId: string, payload: Partial<ProductPayload> & { isActive?: boolean }) {
    saving.value = true;
    try { product.value = await productsApi.updateProduct(productId, payload); return product.value; }
    finally { saving.value = false; }
  }
  async function addVariant(productId: string, payload: Record<string, unknown>) {
    saving.value = true;
    try { product.value = await productsApi.addVariant(productId, payload); return product.value; }
    finally { saving.value = false; }
  }
  async function updateVariant(productId: string, variantId: string, payload: Record<string, unknown>) {
    saving.value = true;
    try { product.value = await productsApi.updateVariant(productId, variantId, payload); return product.value; }
    finally { saving.value = false; }
  }
  async function removeVariant(productId: string, variantId: string) {
    saving.value = true;
    try { product.value = await productsApi.removeVariant(productId, variantId); return product.value; }
    finally { saving.value = false; }
  }
  return { product, loading, saving, error, load, create, update, addVariant, updateVariant, removeVariant };
}
