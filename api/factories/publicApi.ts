import { BaseApi } from '~/api/base/BaseApi';
import type { Invoice, Order, Receipt, StorefrontHome, StorefrontProduct, StorefrontTemplate } from '~/types';

class PublicApi extends BaseApi {
  constructor() { super('/'); }
  storefrontHome(slug: string): Promise<StorefrontHome> { return this.request('get', `storefront/${slug}`); }
  storefrontByDomain(domain: string): Promise<StorefrontHome> { return this.request('get', `storefront/domain/${domain}`); }
  products(slug: string, params: { page?: number; limit?: number; search?: string; category?: string } = {}): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; items: StorefrontProduct[]; meta: { total: number; page: number; limit: number; pages: number } }> {
    return this.request('get', `storefront/${slug}/products`, undefined, params as Record<string, unknown>);
  }
  product(slug: string, id: string): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; product: StorefrontProduct; related: StorefrontProduct[] }> {
    return this.request('get', `storefront/${slug}/products/${id}`);
  }
  placeOrder(slug: string, payload: {
    customerName: string; customerPhone: string; customerEmail?: string; deliveryAddress?: string; deliveryDetails?: string;
    notes?: string; items: { productId: string; variantId?: string; quantity: number }[]; payOnline?: boolean;
  }): Promise<{ order: Order; orderToken: string; whatsappUrl: string | null; whatsappMessage: string; payment: { authorizationUrl: string; reference: string } | null }> {
    return this.request('post', `storefront/${slug}/orders`, payload);
  }
  contact(slug: string, payload: { name: string; phone: string; email?: string; message: string }): Promise<{ sent: boolean; whatsappUrl: string }> {
    return this.request('post', `storefront/${slug}/contact`, payload);
  }
  embed(slug: string): Promise<{ business: StorefrontHome['business']; orderLink: string; currency: string }> { return this.request('get', `storefront/${slug}/embed`); }
  receipt(token: string): Promise<{ receipt: Receipt; business: Record<string, unknown> }> { return this.request('get', `public/receipts/${token}`); }
  invoice(token: string): Promise<{ invoice: Invoice; business: Record<string, unknown> }> { return this.request('get', `public/invoices/${token}`); }
  order(token: string): Promise<{ order: Order; business: Record<string, unknown> }> { return this.request('get', `public/orders/${token}`); }
  debt(token: string): Promise<{ debt: Record<string, unknown>; business: Record<string, unknown>; paystackConfigured: boolean; publicKey?: string | null }> {
    return this.request('get', `public/payments/debt/${token}`);
  }
  payDebt(token: string, email: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> {
    return this.request('post', `public/payments/debt/${token}`, { email });
  }
  payOrder(token: string, email?: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> {
    return this.request('post', `public/payments/order/${token}`, { email });
  }
  payInvoice(token: string, email?: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> {
    return this.request('post', `public/payments/invoice/${token}`, { email });
  }
  verifyPayment(reference: string): Promise<{ status: string; payment: Record<string, unknown> }> {
    return this.request('get', `payments/verify/${reference}`);
  }
  paymentConfig(): Promise<{ configured: boolean; publicKey?: string | null }> { return this.request('get', 'payments/config'); }
}
export const publicApi = new PublicApi();
