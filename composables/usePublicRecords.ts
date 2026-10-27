import { publicApi } from '~/api/factories/publicApi';

export function usePublicReceipt(token: MaybeRefOrGetter<string>) {
  return useAsyncData(() => `public-receipt-${toValue(token)}`, () => publicApi.receipt(toValue(token)), { watch: [() => toValue(token)] });
}

export function usePublicInvoice(token: MaybeRefOrGetter<string>) {
  return useAsyncData(() => `public-invoice-${toValue(token)}`, () => publicApi.invoice(toValue(token)), { watch: [() => toValue(token)] });
}

export function usePublicOrder(token: MaybeRefOrGetter<string>) {
  return useAsyncData(() => `public-order-${toValue(token)}`, () => publicApi.order(toValue(token)), { watch: [() => toValue(token)] });
}

export function usePublicDebt(token: MaybeRefOrGetter<string>) {
  return useAsyncData(() => `public-debt-${toValue(token)}`, () => publicApi.debt(toValue(token)), { watch: [() => toValue(token)] });
}

export function usePayDebt(token: MaybeRefOrGetter<string>) {
  const loading = ref(false);
  const error = ref('');
  async function pay(email: string) {
    loading.value = true; error.value = '';
    try { return await publicApi.payDebt(toValue(token), email); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { loading.value = false; }
  }
  return { loading, error, pay };
}

export function usePayInvoice(token: MaybeRefOrGetter<string>) {
  const loading = ref(false);
  const error = ref('');
  async function pay(email?: string) {
    loading.value = true; error.value = '';
    try { return await publicApi.payInvoice(toValue(token), email); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { loading.value = false; }
  }
  return { loading, error, pay };
}

export function usePayOrder(token: MaybeRefOrGetter<string>) {
  const loading = ref(false);
  const error = ref('');
  async function pay(email?: string) {
    loading.value = true; error.value = '';
    try { return await publicApi.payOrder(toValue(token), email); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { loading.value = false; }
  }
  return { loading, error, pay };
}

export function usePaymentVerification() {
  const loading = ref(true);
  const status = ref<'checking' | 'success' | 'pending' | 'failed'>('checking');
  const nextUrl = ref<string | null>(null);
  const message = ref('');
  async function verify(reference: string) {
    loading.value = true;
    try {
      const result = await publicApi.verifyPayment(reference) as { status: string; nextUrl?: string | null };
      nextUrl.value = result.nextUrl || null;
      if (result.status === 'success') status.value = 'success';
      else if (result.status === 'failed') status.value = 'failed';
      else { status.value = 'pending'; message.value = 'We are waiting for confirmation from Paystack. Refresh to check again.'; }
    } catch (error) {
      status.value = 'failed';
      message.value = (error as Error).message;
    } finally { loading.value = false; }
  }
  return { loading, status, nextUrl, message, verify };
}

export function useEmbedCheckout(slug: MaybeRefOrGetter<string>) {
  const business = ref<{ name: string; slug: string; logoUrl?: string; brandColor: string; tagline: string; whatsappNumber?: string } | null>(null);
  const products = ref<Array<{ id: string; name: string; priceKobo: number; images: string[]; inStock: boolean; variants: { id: string; name: string; priceKobo: number; inStock: boolean }[] }>>([]);
  const loading = ref(true);
  const error = ref('');
  const placing = ref(false);
  async function load() {
    if (!toValue(slug)) { loading.value = false; error.value = 'No business specified.'; return; }
    loading.value = true;
    try {
      const [config, list] = await Promise.all([publicApi.embed(toValue(slug)), publicApi.products(toValue(slug), { limit: 12 })]);
      business.value = config.business as typeof business.value;
      products.value = list.items.map((p) => ({ id: p.id, name: p.name, priceKobo: p.priceKobo, images: p.images, inStock: p.inStock, variants: p.variants.map((v) => ({ id: v.id, name: v.name, priceKobo: v.priceKobo, inStock: v.inStock })) }));
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function place(payload: Parameters<typeof publicApi.placeOrder>[1]) {
    placing.value = true; error.value = '';
    try { return await publicApi.placeOrder(toValue(slug), payload); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { placing.value = false; }
  }
  return { business, products, loading, error, placing, load, place };
}
