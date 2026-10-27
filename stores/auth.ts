import { defineStore } from 'pinia';
import { authApi } from '~/api/factories/authApi';
import { tokenStorage, type ImpersonationSession } from '~/utils/auth-storage';
import type { AuthSession, BusinessSummary, User } from '~/types';
import type { LoginPayload, RegisterPayload } from '~/api/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const businesses = ref<BusinessSummary[]>([]);
  const activeBusinessId = ref<string | null>(null);
  const ready = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const impersonation = ref<ImpersonationSession | null>(null);

  const isAuthenticated = computed(() => Boolean(user.value && tokenStorage.getAccess()));
  const isImpersonating = computed(() => Boolean(impersonation.value));
  const activeBusiness = computed(() => businesses.value.find((b) => b.id === activeBusinessId.value) || null);
  const isOwner = computed(() => activeBusiness.value?.role === 'owner');
  const displayName = computed(() => user.value?.name?.split(' ')[0] || 'Boss');
  const initials = computed(() => (user.value?.name || 'B').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join(''));

  function applySession(session: AuthSession) {
    user.value = session.user;
    businesses.value = session.businesses;
    activeBusinessId.value = session.activeBusinessId;
    tokenStorage.set(session.accessToken, session.refreshToken);
  }

  async function login(payload: LoginPayload) {
    loading.value = true; error.value = null;
    try {
      const session = await authApi.login(payload);
      applySession(session);
      ready.value = true;
      return session;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally { loading.value = false; }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true; error.value = null;
    try {
      const session = await authApi.register(payload);
      applySession(session);
      ready.value = true;
      return session;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally { loading.value = false; }
  }

  async function hydrate(force = false) {
    if (!import.meta.client) return;
    if (ready.value && !force) return;
    impersonation.value = tokenStorage.getImpersonation();
    if (!tokenStorage.getAccess()) { ready.value = true; return; }
    loading.value = true;
    try {
      const me = await authApi.me();
      user.value = me.user;
      businesses.value = me.businesses;
      activeBusinessId.value = me.activeBusinessId;
      ready.value = true;
    } catch {
      user.value = null;
      businesses.value = [];
      activeBusinessId.value = null;
      tokenStorage.clear();
      ready.value = true;
    } finally { loading.value = false; }
  }

  async function ensureReady() {
    if (!ready.value) await hydrate();
  }

  async function fetchMe() {
    const me = await authApi.me();
    user.value = me.user;
    businesses.value = me.businesses;
    activeBusinessId.value = me.activeBusinessId;
    return me;
  }

  async function switchBusiness(businessId: string) {
    loading.value = true;
    try {
      const session = await authApi.switchBusiness(businessId, tokenStorage.getRefresh() || undefined);
      applySession(session);
      return session;
    } finally { loading.value = false; }
  }

  async function updateProfile(payload: { name?: string; phone?: string; avatarUrl?: string }) {
    const updated = await authApi.updateProfile(payload);
    user.value = updated;
    return updated;
  }

  async function logout() {
    const refresh = tokenStorage.getRefresh() || undefined;
    if (refresh) { try { await authApi.logout(refresh); } catch { /* session may already be gone */ } }
    tokenStorage.clear();
    impersonation.value = null;
    user.value = null;
    businesses.value = [];
    activeBusinessId.value = null;
    ready.value = true;
  }

  async function forgotPassword(email: string) { return authApi.forgotPassword(email); }

  async function resetPassword(token: string, password: string) {
    const result = await authApi.resetPassword(token, password);
    clearSession();
    return result;
  }

  async function verifyEmail(token: string) {
    const result = await authApi.verifyEmail(token);
    if (user.value) user.value.emailVerified = true;
    return result;
  }

  async function resendVerification() { return authApi.resendVerification(); }

  async function acceptImpersonation(session: ImpersonationSession) {
    tokenStorage.setImpersonation(session);
    impersonation.value = session;
    ready.value = false;
    const me = await authApi.me();
    user.value = me.user;
    businesses.value = me.businesses;
    activeBusinessId.value = me.activeBusinessId || session.businessId;
    ready.value = true;
    return me;
  }

  function exitImpersonation() {
    const businessId = impersonation.value?.businessId;
    tokenStorage.clearImpersonation();
    impersonation.value = null;
    user.value = null;
    businesses.value = [];
    activeBusinessId.value = null;
    ready.value = false;
    return businessId;
  }

  function clearSession() {
    tokenStorage.clearImpersonation();
    impersonation.value = null;
    tokenStorage.clear();
    user.value = null;
    businesses.value = [];
    activeBusinessId.value = null;
  }

  return {
    user, businesses, activeBusinessId, ready, loading, error, impersonation,
    isAuthenticated, isImpersonating, activeBusiness, isOwner, displayName, initials,
    login, register, hydrate, ensureReady, fetchMe, switchBusiness, updateProfile, logout, clearSession, applySession,
    forgotPassword, resetPassword, verifyEmail, resendVerification, acceptImpersonation, exitImpersonation,
  };
});
