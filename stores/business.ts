import { defineStore } from 'pinia';
import { businessesApi } from '~/api/factories/businessesApi';
import type { Business, BusinessContext, Entitlements, Onboarding, Plan, Subscription } from '~/types';

const emptyEntitlements: Entitlements = {
  productLimit: 0, staffSeats: 0, customDomain: false, advancedReports: false, csvExport: false, pdfExport: false,
  embedWidget: false, whatsappBot: false, templates: [], receiptBranding: false, prioritySupport: false,
};

export const useBusinessStore = defineStore('business', () => {
  const context = ref<BusinessContext | null>(null);
  const onboarding = ref<Onboarding | null>(null);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  const business = computed<Business | null>(() => context.value?.business ?? null);
  const plan = computed<Plan | null>(() => context.value?.plan ?? null);
  const subscription = computed<Subscription | null>(() => context.value?.subscription ?? null);
  const entitlements = computed<Entitlements>(() => context.value?.entitlements ?? emptyEntitlements);
  const usage = computed(() => context.value?.usage ?? null);
  const storefrontUrls = computed(() => context.value?.storefront ?? null);
  const isTrial = computed(() => subscription.value?.status === 'trialing');
  const trialDaysLeft = computed(() => {
    if (!subscription.value?.trialEndsAt) return 0;
    return Math.max(0, Math.ceil((new Date(subscription.value.trialEndsAt).getTime() - Date.now()) / 86400000));
  });

  async function load(force = false) {
    if (loaded.value && !force) return context.value;
    loading.value = true; error.value = null;
    try {
      const [ctx, ob] = await Promise.all([businessesApi.current(), businessesApi.onboarding()]);
      context.value = ctx;
      onboarding.value = ob;
      loaded.value = true;
      return ctx;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally { loading.value = false; }
  }

  async function refreshOnboarding() {
    onboarding.value = await businessesApi.onboarding();
    return onboarding.value;
  }

  async function update(payload: Partial<Business>) {
    const updated = await businessesApi.updateBusiness(payload);
    if (context.value) context.value.business = updated;
    return updated;
  }

  async function markStep(step: string) {
    onboarding.value = await businessesApi.markOnboardingStep(step);
    return onboarding.value;
  }

  function reset() {
    context.value = null;
    onboarding.value = null;
    loaded.value = false;
    error.value = null;
  }

  return { context, onboarding, loading, loaded, error, business, plan, subscription, entitlements, usage, storefrontUrls, isTrial, trialDaysLeft, load, refreshOnboarding, update, markStep, reset };
});
