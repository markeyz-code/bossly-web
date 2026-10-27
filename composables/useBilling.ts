import { plansApi } from '~/api/factories/plansApi';
import { paymentsApi } from '~/api/factories/paymentsApi';
import type { Plan } from '~/types';

export function useBilling() {
  const plans = ref<Plan[]>([]);
  const loading = ref(false);
  const checkingOut = ref(false);
  async function load() { loading.value = true; try { plans.value = await plansApi.listPlans(); } finally { loading.value = false; } }
  async function checkout(planKey: string, interval: 'monthly' | 'yearly', couponCode?: string) {
    checkingOut.value = true;
    try { return await paymentsApi.checkoutSubscription({ planKey, interval, couponCode }); }
    finally { checkingOut.value = false; }
  }
  return { plans, loading, checkingOut, load, checkout };
}
