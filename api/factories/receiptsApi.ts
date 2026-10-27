import { BaseApi } from '../base/BaseApi';
import type { Invoice, Receipt } from '~/types';

class ReceiptsApi extends BaseApi {
  constructor() { super(''); }
  getReceipt(id: string): Promise<Receipt> { return this.request('get', `/receipts/${id}`); }
  listReceipts(params: { page?: number; limit?: number; search?: string } = {}): Promise<{ items: Receipt[]; meta: Record<string, number> }> {
    return this.request('get', '/receipts', undefined, params as Record<string, unknown>);
  }
  listInvoices(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ items: Invoice[]; meta: Record<string, number> }> {
    return this.request('get', '/invoices', undefined, params as Record<string, unknown>);
  }
  createInvoice(payload: {
    customerName: string; customerEmail?: string; customerPhone?: string; customerAddress?: string;
    items: { name: string; quantity: number; unitPriceKobo: number; productId?: string }[];
    discountKobo?: number; deliveryFeeKobo?: number; dueDate: string; notes?: string; sendEmail?: boolean;
  }): Promise<Invoice> { return this.request('post', '/invoices', payload); }
  sendInvoice(id: string): Promise<{ sent: boolean }> { return this.request('post', `/invoices/${id}/send`); }
  markInvoicePaid(id: string): Promise<Invoice> { return this.request('patch', `/invoices/${id}/paid`); }
}
export const receiptsApi = new ReceiptsApi();
