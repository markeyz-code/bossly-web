import { BaseApi } from '~/api/base/BaseApi';
import type { OrderPayload } from '~/api/types';

class WhatsappApi extends BaseApi {
  constructor() { super('/whatsapp'); }
  status(): Promise<{
    configured: boolean; readiness: Record<string, boolean>; missing: string[]; platformNumber?: string | null; webhookUrl: string;
    contacts: { id: string; phone: string; verifiedAt?: string; lastInboundAt?: string; displayName?: string; alertsOptOut: boolean }[];
    templates: { name: string; params: number; description: string }[];
  }> { return this.request('get', '/status'); }
  generateOtp(): Promise<{ code: string; expiresInSeconds: number; platformNumber?: string | null; waLink?: string | null; instructions: string }> {
    return this.request('post', '/otp');
  }
  test(): Promise<{ sent: boolean; usedTemplate?: boolean; reason?: string }> { return this.request('post', '/test'); }
  unlink(id: string): Promise<{ unlinked: boolean }> { return this.request('delete', `/contacts/${id}`); }
  parseChat(text: string): Promise<Record<string, unknown>> { return this.request('post', '/paste-chat', { text }); }
  confirmPasteChat(payload: OrderPayload): Promise<unknown> { return this.request('post', '/paste-chat/confirm', payload); }
  previewSummary(period: 'daily' | 'weekly'): Promise<{ text: string; shareLink: string; [key: string]: unknown }> {
    return this.request('get', '/../summaries/preview', undefined, { period });
  }
  sendSummary(period: 'daily' | 'weekly'): Promise<{ whatsapp: boolean; email: boolean }> {
    return this.request('post', `/../summaries/send?period=${period}`);
  }
}
export const whatsappApi = new WhatsappApi();
