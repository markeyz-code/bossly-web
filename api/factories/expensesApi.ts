import { BaseApi } from '~/api/base/BaseApi';
import type { Expense } from '~/types';

class ExpensesApi extends BaseApi {
  constructor() { super('/expenses'); }
  listExpenses(params: { page?: number; limit?: number; category?: string; from?: string; to?: string; search?: string } = {}) {
    return this.request<{ items: Expense[]; categories: { key: string; label: string }[]; meta: { total: number; page: number; limit: number; pages: number; totalAmountKobo: number; byCategory: { category: string; totalKobo: number; count: number }[] } }>('get', '', undefined, params as Record<string, unknown>);
  }
  categories(): Promise<{ key: string; label: string }[]> { return this.request('get', '/categories'); }
  createExpense(payload: { category: string; amountKobo: number; date: string; notes?: string; receiptUrl?: string; recurrence?: string; recurrenceEndsAt?: string }): Promise<Expense> {
    return this.request('post', '', payload);
  }
  updateExpense(id: string, payload: Record<string, unknown>): Promise<Expense> { return this.update(id, payload); }
  removeExpense(id: string): Promise<{ deleted: boolean }> { return this.remove(id); }
}
export const expensesApi = new ExpensesApi();
