import { publicApi } from '~/api/factories/publicApi';

export function useStorefrontHome(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `storefront-home-${toValue(slug)}`,
    () => publicApi.storefrontHome(toValue(slug)),
    { watch: [() => toValue(slug)] },
  );
}

export function useStorefrontProducts(slug: MaybeRefOrGetter<string>, query: MaybeRefOrGetter<{ search?: string; category?: string; page?: number }>) {
  return useAsyncData(
    () => `storefront-products-${toValue(slug)}-${JSON.stringify(toValue(query))}`,
    () => publicApi.products(toValue(slug), toValue(query)),
    { watch: [() => toValue(slug), () => JSON.stringify(toValue(query))] },
  );
}

export function useStorefrontProduct(slug: MaybeRefOrGetter<string>, id: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `storefront-product-${toValue(slug)}-${toValue(id)}`,
    () => publicApi.product(toValue(slug), toValue(id)),
    { watch: [() => toValue(slug), () => toValue(id)] },
  );
}

export function useStorefrontCheckout(slug: string) {
  const submitting = ref(false);
  const error = ref<string | null>(null);
  const result = ref<Awaited<ReturnType<typeof publicApi.placeOrder>> | null>(null);
  async function place(payload: Parameters<typeof publicApi.placeOrder>[1]) {
    submitting.value = true; error.value = null;
    try { result.value = await publicApi.placeOrder(slug, payload); return result.value; }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { submitting.value = false; }
  }
  async function contact(payload: Parameters<typeof publicApi.contact>[1]) { return publicApi.contact(slug, payload); }
  return { submitting, error, result, place, contact };
}
