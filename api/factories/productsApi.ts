import { BaseApi } from '~/api/base/BaseApi';
import type { Product } from '~/types';
import type { ProductPayload } from '~/api/types';

class ProductsApi extends BaseApi {
  constructor() { super('/products'); }
  async listProducts(params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}) {
    return this.request<{ items: Product[]; meta: { total: number; page: number; limit: number; pages: number } }>('get', '', undefined, params as Record<string, unknown>);
  }
  categories(): Promise<string[]> { return this.request('get', '/categories'); }
  lowStock(): Promise<{ productId: string; variantId: string; name: string; variantName: string; imageUrl?: string; quantity: number; threshold: number; outOfStock: boolean; priceKobo: number }[]> {
    return this.request('get', '/low-stock');
  }
  createProduct(payload: ProductPayload): Promise<Product> { return this.request('post', '', payload); }
  updateProduct(id: string, payload: Partial<ProductPayload> & { isActive?: boolean }): Promise<Product> { return this.request('patch', `/${id}`, payload); }
  deactivate(id: string): Promise<{ deactivated: boolean }> { return this.request('delete', `/${id}`); }
  addVariant(id: string, payload: Record<string, unknown>): Promise<Product> { return this.request('post', `/${id}/variants`, payload); }
  updateVariant(id: string, variantId: string, payload: Record<string, unknown>): Promise<Product> { return this.request('patch', `/${id}/variants/${variantId}`, payload); }
  removeVariant(id: string, variantId: string): Promise<Product> { return this.request('delete', `/${id}/variants/${variantId}`); }
}
export const productsApi = new ProductsApi();
