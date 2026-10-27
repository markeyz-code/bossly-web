import { plansApi } from '~/api/factories/plansApi';

export function usePublicPlans() {
  return useAsyncData('public-plans', () => plansApi.listPlans(), { default: () => [] });
}
