import { BaseApi } from '../base/BaseApi';
import type { Notification } from '~/types';

class NotificationsApi extends BaseApi {
  constructor() { super('/notifications'); }
  listNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean; type?: string } = {}) {
    return this.request<{ items: Notification[]; unread: number; meta: { total: number; page: number; limit: number; pages: number } }>('get', '', undefined, params as Record<string, unknown>);
  }
  markRead(id: string): Promise<{ read: boolean }> { return this.request('patch', `/${id}/read`); }
  markAllRead(): Promise<{ read: boolean }> { return this.request('patch', '/read-all'); }
  removeNotification(id: string): Promise<{ deleted: boolean }> { return this.remove(id); }
}
export const notificationsApi = new NotificationsApi();
