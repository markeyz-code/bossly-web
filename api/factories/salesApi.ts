import { BaseApi } from '~/api/base/BaseApi';
import type { Sale } from '~/types';
import type { SalePayload } from '~/api/types';

class SalesApi extends BaseApi {
  constructor() { super('/sales'); }
  listSales(params: { page?: number; limit?: number; period?: string; from?: string; to?: string; search?: string; paymentStatus?: string } = {}) {
    return this.request<{ items: Sale[]; meta: { total: number; page: number; limit: number; pages: number; revenueKobo: number; profitKobo: number } }>('get', '', undefined, params as Record<string, unknown>);
  }
  createSale(payload: SalePayload): Promise<Sale> { return this.request('post', '', payload); }
  voidSale(id: string, reason: string): Promise<{ voided: boolean; saleNumber: string }> { return this.request('post', `/${id}/void`, { reason }); }
  resendReceipt(id: string): Promise<{ sent: boolean; receiptToken: string }> { return this.request('post', `/${id}/receipt/resend`); }
}
export const salesApi = new SalesApi();
