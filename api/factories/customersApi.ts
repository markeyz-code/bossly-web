import { BaseApi } from '../base/BaseApi';
import type { Customer, Debt, Order, Sale } from '~/types';

class CustomersApi extends BaseApi {
  constructor() { super('/customers'); }
  listCustomers(params: { page?: number; limit?: number; search?: string; filter?: string } = {}) {
    return this.request<{ items: Customer[]; meta: { total: number; page: number; limit: number; pages: number; owing: number; totalOutstandingKobo: number } }>('get', '', undefined, params as Record<string, unknown>);
  }
  getCustomer(id: string): Promise<{ customer: Customer; sales: Sale[]; debts: Debt[]; orders: Order[] }> { return this.get(id); }
  createCustomer(payload: { name: string; phone: string; email?: string; address?: string; notes?: string }): Promise<Customer> {
    return this.request('post', '', payload);
  }
  updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> { return this.update(id, payload); }
  removeCustomer(id: string): Promise<{ removed: boolean }> { return this.remove(id); }
}
export const customersApi = new CustomersApi();
