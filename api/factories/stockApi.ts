import { BaseApi } from '../base/BaseApi';
import type { Product } from '~/types';

class StockApi extends BaseApi {
  constructor() { super('/stock'); }
  summary(): Promise<{ products: number; units: number; retailValueKobo: number; costValueKobo: number; potentialProfitKobo: number; lowStock: number; outOfStock: number }> {
    return this.request('get', '/summary');
  }
  movements(params: { page?: number; limit?: number; productId?: string; type?: string; from?: string; to?: string } = {}) {
    return this.request<{ items: Record<string, unknown>[]; meta: { total: number; page: number; limit: number; pages: number; inbound: number; outbound: number } }>('get', '/movements', undefined, params as Record<string, unknown>);
  }
  restock(productId: string, payload: { variantId: string; quantity: number; unitCostKobo?: number; note?: string }): Promise<Product> {
    return this.request('post', `/products/${productId}/restock`, payload);
  }
  adjust(productId: string, payload: { variantId: string; delta: number; note: string }): Promise<Product> {
    return this.request('post', `/products/${productId}/adjust`, payload);
  }
}
export const stockApi = new StockApi();
