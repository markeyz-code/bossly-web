import { notificationsApi } from '~/api/factories/notificationsApi';
import type { Notification } from '~/types';

export function useNotifications() {
  const items = useState<Notification[]>('notifications-items', () => []);
  const unread = useState<number>('notifications-unread', () => 0);
  const loading = useState<boolean>('notifications-loading', () => false);
  const loaded = useState<boolean>('notifications-loaded', () => false);

  async function fetchNotifications(opts: { unreadOnly?: boolean; page?: number; limit?: number; force?: boolean } = {}) {
    if (loaded.value && !opts.force && !opts.unreadOnly) return;
    loading.value = true;
    try {
      const result = await notificationsApi.listNotifications({ page: opts.page || 1, limit: opts.limit || 20, unreadOnly: opts.unreadOnly });
      items.value = result.items;
      unread.value = result.unread;
      loaded.value = true;
    } finally { loading.value = false; }
  }

  async function markRead(id: string) {
    await notificationsApi.markRead(id);
    const item = items.value.find((n) => n.id === id);
    if (item && !item.readAt) unread.value = Math.max(0, unread.value - 1);
    if (item) item.readAt = new Date().toISOString();
  }

  async function markAllRead() {
    await notificationsApi.markAllRead();
    items.value.forEach((i) => { i.readAt = new Date().toISOString(); });
    unread.value = 0;
  }

  async function remove(id: string) {
    const wasUnread = !items.value.find((n) => n.id === id)?.readAt;
    await notificationsApi.removeNotification(id);
    items.value = items.value.filter((n) => n.id !== id);
    if (wasUnread) unread.value = Math.max(0, unread.value - 1);
  }

  function reset() { items.value = []; unread.value = 0; loaded.value = false; }

  return { items, unread, loading, loaded, fetchNotifications, markRead, markAllRead, remove, reset };
}
