import { BaseApi } from '~/api/base/BaseApi';
import type { Order } from '~/types';
import type { OrderPayload } from '~/api/types';

class OrdersApi extends BaseApi {
  constructor() { super('/orders'); }
  listOrders(params: { page?: number; limit?: number; status?: string; source?: string; search?: string } = {}) {
    return this.request<{ items: Order[]; meta: { total: number; page: number; limit: number; pages: number; statusCounts: Record<string, number> } }>('get', '', undefined, params as Record<string, unknown>);
  }
  getOrder(id: string): Promise<Order> { return this.request('get', `/${id}`); }
  createOrder(payload: OrderPayload): Promise<Order> { return this.request('post', '', payload); }
  confirm(id: string): Promise<Order> { return this.request('post', `/${id}/confirm`); }
  recordPayment(id: string, payload: { amountKobo: number; method?: string; reference?: string; note?: string }): Promise<Order> {
    return this.request('post', `/${id}/payments`, payload);
  }
  deliver(id: string, note?: string): Promise<Order> { return this.request('patch', `/${id}/deliver`, { note }); }
  cancel(id: string, reason?: string): Promise<Order> { return this.request('post', `/${id}/cancel`, { reason }); }
}
export const ordersApi = new OrdersApi();
