import { useAuthStore } from '~/stores/auth';
import { authApi } from '~/api/factories/authApi';

export function useProfile() {
  const auth = useAuthStore();
  const saving = ref(false);
  const changing = ref(false);
  async function update(payload: { name?: string; phone?: string; avatarUrl?: string }) {
    saving.value = true;
    try { return await auth.updateProfile(payload); }
    finally { saving.value = false; }
  }
  async function changePassword(currentPassword: string, newPassword: string) {
    changing.value = true;
    try { return await authApi.changePassword({ currentPassword, newPassword }); }
    finally { changing.value = false; }
  }
  async function resendVerification() { return authApi.resendVerification(); }
  return { saving, changing, update, changePassword, resendVerification };
}
