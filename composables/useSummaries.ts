import { whatsappApi } from '~/api/factories/whatsappApi';

export function useSummaries() {
  const preview = ref<{ text: string; shareLink: string; [key: string]: unknown } | null>(null);
  const loading = ref(false);
  const sending = ref(false);

  async function load(period: 'daily' | 'weekly') { loading.value = true; try { preview.value = await whatsappApi.previewSummary(period); } finally { loading.value = false; } }
  async function send(period: 'daily' | 'weekly') { sending.value = true; try { return await whatsappApi.sendSummary(period); } finally { sending.value = false; } }
  return { preview, loading, sending, load, send };
}
