import { receiptsApi } from '~/api/factories/receiptsApi';
import { paymentsApi } from '~/api/factories/paymentsApi';
import type { Invoice, Receipt } from '~/types';

export function useReceipts() {
  const receipts = ref<Receipt[]>([]);
  const invoices = ref<Invoice[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const receiptMeta = reactive({ total: 0, page: 1, pages: 0 });
  const invoiceMeta = reactive({ total: 0, page: 1, pages: 0 });
  async function loadReceipts(page = 1) {
    loading.value = true;
    try { const result = await receiptsApi.listReceipts({ page, limit: 20 }); receipts.value = result.items; Object.assign(receiptMeta, result.meta); }
    finally { loading.value = false; }
  }
  async function loadInvoices(page = 1, status = '') {
    loading.value = true;
    try { const result = await receiptsApi.listInvoices({ page, limit: 20, status: status || undefined }); invoices.value = result.items; Object.assign(invoiceMeta, result.meta); }
    finally { loading.value = false; }
  }
  async function create(payload: Parameters<typeof receiptsApi.createInvoice>[0]) { saving.value = true; try { return await receiptsApi.createInvoice(payload); } finally { saving.value = false; } }
  async function getReceipt(id: string) { return receiptsApi.getReceipt(id); }
  async function paymentLink(id: string) { return paymentsApi.linkInvoice(id); }
  async function send(id: string) { return receiptsApi.sendInvoice(id); }
  async function markPaid(id: string) { return receiptsApi.markInvoicePaid(id); }
  return { receipts, invoices, loading, saving, receiptMeta, invoiceMeta, loadReceipts, loadInvoices, getReceipt, paymentLink, create, send, markPaid };
}
