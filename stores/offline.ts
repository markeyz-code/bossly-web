import { defineStore } from 'pinia';
import { salesApi } from '~/api/factories/salesApi';
import { expensesApi } from '~/api/factories/expensesApi';
import { isNetworkError } from '~/utils/errors';
import { useToast } from '~/composables/useToast';
import type { SalePayload } from '~/api/types';

const KEY = 'bossly.offline-queue.v1';

export interface QueueItem {
  id: string;
  type: 'sale' | 'expense';
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  attempts: number;
}

export const useOfflineStore = defineStore('offline', () => {
  const queue = ref<QueueItem[]>([]);
  const hydrated = ref(false);
  const syncing = ref(false);
  const online = ref(true);

  const pending = computed(() => queue.value.filter((q) => q.status !== 'failed'));
  const failed = computed(() => queue.value.filter((q) => q.status === 'failed'));
  const pendingCount = computed(() => pending.value.length);

  function persist() {
    if (!import.meta.client) return;
    localStorage.setItem(KEY, JSON.stringify(queue.value));
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) queue.value = JSON.parse(raw) as QueueItem[];
    } catch { queue.value = []; }
    hydrated.value = true;
    online.value = navigator.onLine;
  }

  function enqueue(type: QueueItem['type'], payload: Record<string, unknown>) {
    const item: QueueItem = {
      id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type, payload, createdAt: new Date().toISOString(), status: 'pending', attempts: 0,
    };
    queue.value.push(item);
    persist();
    return item;
  }

  async function sync() {
    if (syncing.value || !import.meta.client) return { synced: 0, failed: 0 };
    if (!navigator.onLine) { online.value = false; return { synced: 0, failed: 0 }; }
    syncing.value = true;
    let synced = 0; let failed = 0;
    try {
      for (const item of [...queue.value]) {
        if (item.status === 'failed') continue;
        item.status = 'syncing'; item.attempts += 1; persist();
        try {
          if (item.type === 'sale') await salesApi.createSale(item.payload as unknown as SalePayload);
          else await expensesApi.createExpense(item.payload as unknown as Parameters<typeof expensesApi.createExpense>[0]);
          queue.value = queue.value.filter((q) => q.id !== item.id);
          synced++; persist();
        } catch (error) {
          if (isNetworkError(error)) {
            item.status = 'pending'; persist(); break;
          }
          item.status = 'failed';
          item.error = (error as Error).message;
          failed++; persist();
        }
      }
    } finally {
      syncing.value = false;
      online.value = navigator.onLine;
    }
    return { synced, failed };
  }

  function retry(id: string) {
    const item = queue.value.find((q) => q.id === id);
    if (item) { item.status = 'pending'; item.error = undefined; persist(); void sync(); }
  }

  function remove(id: string) {
    queue.value = queue.value.filter((q) => q.id !== id);
    persist();
  }

  function setOnline(value: boolean) { online.value = value; }

  function queueSale(payload: Record<string, unknown>) {
    enqueue('sale', payload);
    useToast().info('Sale saved on this device. It will sync when you’re back online.', 'Offline sale queued');
  }

  function queueExpense(payload: Record<string, unknown>) {
    enqueue('expense', payload);
    useToast().info('Expense saved on this device. It will sync when you’re back online.', 'Offline expense queued');
  }

  return { queue, hydrated, syncing, online, pending, failed, pendingCount, hydrate, enqueue, sync, retry, remove, setOnline, queueSale, queueExpense };
});
