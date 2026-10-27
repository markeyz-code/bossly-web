import { BaseApi } from '~/api/base/BaseApi';
import type { AffiliateOverview, AffiliatePayout, AffiliatePayoutDetails } from '~/types';

class AffiliatesApi extends BaseApi {
  constructor() { super(''); }
  overview(): Promise<AffiliateOverview> { return this.request('get', '/affiliates/me'); }
  payouts(): Promise<AffiliatePayout[]> { return this.request('get', '/affiliates/payouts'); }
  updateDetails(payload: AffiliatePayoutDetails): Promise<AffiliatePayoutDetails> {
    return this.request('patch', '/affiliates/payout-details', payload);
  }
  requestPayout(payload: AffiliatePayoutDetails & { amountKobo: number }): Promise<{ payout: AffiliatePayout; availableKobo: number }> {
    return this.request('post', '/affiliates/payouts', payload);
  }
}
export const affiliatesApi = new AffiliatesApi();
