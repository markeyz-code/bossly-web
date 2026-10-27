import { BaseApi } from '~/api/base/BaseApi';
import type { Plan } from '~/types';

class PlansApi extends BaseApi {
  constructor() { super('/plans'); }
  listPlans(): Promise<Plan[]> { return this.request('get', ''); }
}
export const plansApi = new PlansApi();
