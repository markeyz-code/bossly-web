import { BaseApi } from '../base/BaseApi';
import type { DashboardData } from '~/types';

class ReportsApi extends BaseApi {
  constructor() { super('/reports'); }
  dashboard(params: { range?: string; from?: string; to?: string } = {}): Promise<DashboardData> {
    return this.request('get', '/dashboard', undefined, params as Record<string, unknown>);
  }
  downloadCsv(params: { range?: string; from?: string; to?: string } = {}): Promise<Blob> {
    return this.downloadBlob('/export/csv', params as Record<string, unknown>);
  }
  downloadPdf(params: { range?: string; from?: string; to?: string } = {}): Promise<Blob> {
    return this.downloadBlob('/export/pdf', params as Record<string, unknown>);
  }
}
export const reportsApi = new ReportsApi();
