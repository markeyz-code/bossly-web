import { businessesApi } from '~/api/factories/businessesApi';
import type { StaffMember } from '~/types';

export function useStaff() {
  const staff = ref<StaffMember[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  async function load() { loading.value = true; try { staff.value = await businessesApi.staff(); } finally { loading.value = false; } }
  async function invite(payload: { name: string; email: string; permissions?: string[] }) { saving.value = true; try { const r = await businessesApi.inviteStaff(payload); await load(); return r; } finally { saving.value = false; } }
  async function update(id: string, payload: { permissions?: string[]; status?: string }) { saving.value = true; try { await businessesApi.updateStaff(id, payload); await load(); } finally { saving.value = false; } }
  async function remove(id: string) { saving.value = true; try { await businessesApi.removeStaff(id); await load(); } finally { saving.value = false; } }
  return { staff, loading, saving, load, invite, update, remove };
}
