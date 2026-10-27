import { BaseApi } from '../base/BaseApi';
import type { PaymentLinkResult } from '~/types';

class PaymentsApi extends BaseApi {
  constructor() { super('/payments'); }
  config(): Promise<{ provider: string; configured: boolean; publicKey?: string | null }> { return this.request('get', '/config'); }
  listPayments(params: { page?: number; limit?: number; purpose?: string; status?: string } = {}) {
    return this.request<{ items: Record<string, unknown>[]; meta: Record<string, unknown> }>('get', '', undefined, params as Record<string, unknown>);
  }
  linkOrder(orderId: string, email?: string): Promise<PaymentLinkResult> { return this.request('post', `/links/order/${orderId}`, { email }); }
  linkDebt(debtId: string, email?: string): Promise<PaymentLinkResult> { return this.request('post', `/links/debt/${debtId}`, { email }); }
  linkInvoice(invoiceId: string, email?: string): Promise<PaymentLinkResult> { return this.request('post', `/links/invoice/${invoiceId}`, { email }); }
  checkoutSubscription(payload: { planKey: string; interval?: 'monthly' | 'yearly'; couponCode?: string }): Promise<PaymentLinkResult & { discountKobo?: number }> {
    return this.request('post', '/checkout/subscription', payload);
  }
  verify(reference: string): Promise<Record<string, unknown>> { return this.request('get', `/verify/${reference}`); }
}
export const paymentsApi = new PaymentsApi();
