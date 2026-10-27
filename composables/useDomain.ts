import { businessesApi } from '~/api/factories/businessesApi';

export function useDomain() {
  const saving = ref(false);
  const verifying = ref(false);
  const result = ref<{ verified: boolean; domain: string; expectedCname: string; reason: string } | null>(null);
  const instructions = ref<Record<string, string> | null>(null);
  async function setDomain(domain: string) {
    saving.value = true;
    try { const response = await businessesApi.setDomain(domain); instructions.value = response.instructions; result.value = null; return response; }
    finally { saving.value = false; }
  }
  async function verify() {
    verifying.value = true;
    try { result.value = await businessesApi.verifyDomain(); return result.value; }
    finally { verifying.value = false; }
  }
  async function remove() { return businessesApi.removeDomain(); }
  return { saving, verifying, result, instructions, setDomain, verify, remove };
}
