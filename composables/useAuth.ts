import { useAuthStore } from '~/stores/auth';

/** Auth is global state: return the Pinia store itself so reactivity survives. */
export function useAuth() {
  return useAuthStore();
}
