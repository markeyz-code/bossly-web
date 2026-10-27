import { whatsappApi } from '~/api/factories/whatsappApi';
import type { OrderPayload } from '~/api/types';

export function useWhatsApp() {
  const status = ref<Awaited<ReturnType<typeof whatsappApi.status>> | null>(null);
  const loading = ref(false);
  const otp = ref<Awaited<ReturnType<typeof whatsappApi.generateOtp>> | null>(null);
  const generating = ref(false);

  async function load() { loading.value = true; try { status.value = await whatsappApi.status(); } finally { loading.value = false; } }
  async function generateOtp() { generating.value = true; try { otp.value = await whatsappApi.generateOtp(); return otp.value; } finally { generating.value = false; } }
  async function test() { return whatsappApi.test(); }
  async function unlink(id: string) { await whatsappApi.unlink(id); await load(); }
  async function parseChat(text: string) { return whatsappApi.parseChat(text); }
  async function confirmChat(payload: OrderPayload) { return whatsappApi.confirmPasteChat(payload); }
  return { status, loading, otp, generating, load, generateOtp, test, unlink, parseChat, confirmChat };
}
