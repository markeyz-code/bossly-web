import { BaseApi } from '~/api/base/BaseApi';
import type { BuilderData, Business, StorefrontTemplate } from '~/types';

class BuilderApi extends BaseApi {
  constructor() { super('/builder'); }
  getBuilder(): Promise<BuilderData> { return this.request('get', ''); }
  templates(): Promise<StorefrontTemplate[]> { return this.request('get', '/templates'); }
  updateBuilder(payload: Partial<Business>): Promise<Business> { return this.request('patch', '', payload); }
  publish(): Promise<{ published: boolean; url: string }> { return this.request('post', '/publish'); }
  unpublish(): Promise<{ published: boolean }> { return this.request('post', '/unpublish'); }
}
export const builderApi = new BuilderApi();
