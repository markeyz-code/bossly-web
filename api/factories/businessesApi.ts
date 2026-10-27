import { BaseApi } from '~/api/base/BaseApi';
import type { Business, BusinessContext, Onboarding, StaffMember } from '~/types';

class BusinessesApi extends BaseApi {
  constructor() { super('/businesses'); }
  current(): Promise<BusinessContext> { return this.request('get', '/current'); }
  categories(): Promise<{ key: string; label: string }[]> { return this.request('get', '/categories'); }
  updateBusiness(payload: Partial<Business>): Promise<Business> { return this.request('patch', '/current', payload); }
  onboarding(): Promise<Onboarding> { return this.request('get', '/current/onboarding'); }
  markOnboardingStep(step: string): Promise<Onboarding> { return this.request('post', `/current/onboarding/${step}`); }
  staff(): Promise<StaffMember[]> { return this.request('get', '/current/staff'); }
  inviteStaff(payload: { name: string; email: string; permissions?: string[] }): Promise<{ id: string; email: string; invited: boolean; newAccount: boolean }> {
    return this.request('post', '/current/staff', payload);
  }
  updateStaff(id: string, payload: { permissions?: string[]; status?: string }): Promise<StaffMember> {
    return this.request('patch', `/current/staff/${id}`, payload);
  }
  removeStaff(id: string): Promise<{ removed: boolean }> { return this.request('delete', `/current/staff/${id}`); }
  setDomain(domain: string): Promise<{ customDomain: string; verified: boolean; instructions: Record<string, string> }> {
    return this.request('post', '/current/custom-domain', { domain });
  }
  verifyDomain(): Promise<{ verified: boolean; domain: string; expectedCname: string; reason: string }> {
    return this.request('post', '/current/custom-domain/verify');
  }
  removeDomain(): Promise<{ removed: boolean }> { return this.request('delete', '/current/custom-domain'); }
}
export const businessesApi = new BusinessesApi();
