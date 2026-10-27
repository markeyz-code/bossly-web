import { BaseApi } from '~/api/base/BaseApi';
import type { Debt } from '~/types';

class DebtsApi extends BaseApi {
  constructor() { super('/debts'); }
  listDebts(params: { page?: number; limit?: number; search?: string; status?: string; customerId?: string } = {}) {
    return this.request<{ items: Debt[]; meta: { total: number; page: number; limit: number; pages: number; totalOutstandingKobo: number; overdueKobo: number; overdueCount: number } }>('get', '', undefined, params as Record<string, unknown>);
  }
  summary(): Promise<{ outstandingKobo: number; count: number; overdueKobo: number; overdueCount: number }> { return this.request('get', '/summary'); }
  getDebt(id: string): Promise<Debt> { return this.get(id); }
  createDebt(payload: { customerId?: string; customerName: string; customerPhone: string; customerEmail?: string; amountKobo: number; dueDate: string; notes?: string }): Promise<Debt> {
    return this.request('post', '', payload);
  }
  recordPayment(id: string, payload: { amountKobo: number; method?: string; reference?: string; note?: string }): Promise<Debt> {
    return this.request('post', `/${id}/payments`, payload);
  }
  remind(id: string, channel: 'whatsapp' | 'email'): Promise<{ link?: string; message?: string; sent?: boolean; channel: string }> {
    return this.request('post', `/${id}/remind`, { channel });
  }
  publicDebt(token: string): Promise<Record<string, unknown>> { return this.request('get', `/../public/debts/${token}`); }
}
export const debtsApi = new DebtsApi();
