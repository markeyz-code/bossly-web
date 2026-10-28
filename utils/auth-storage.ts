const ACCESS = 'ojaly.access';
const REFRESH = 'ojaly.refresh';
const IMPERSONATION = 'ojaly.impersonation';

export interface ImpersonationSession {
  token: string;
  businessId: string;
  userName: string;
  expiresAt: string;
}

function readImpersonation(): ImpersonationSession | null {
  if (!import.meta.client) return null;
  try {
    const raw = sessionStorage.getItem(IMPERSONATION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImpersonationSession;
    if (!parsed.token || !parsed.expiresAt || new Date(parsed.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(IMPERSONATION);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(IMPERSONATION);
    return null;
  }
}

export const tokenStorage = {
  getAccess(): string | null {
    if (!import.meta.client) return null;
    return readImpersonation()?.token || localStorage.getItem(ACCESS);
  },
  getRefresh(): string | null {
    if (!import.meta.client) return null;
    if (readImpersonation()) return null;
    return localStorage.getItem(REFRESH);
  },
  getImpersonation(): ImpersonationSession | null {
    return readImpersonation();
  },
  isImpersonating(): boolean {
    return Boolean(readImpersonation());
  },
  set(accessToken: string, refreshToken?: string): void {
    if (!import.meta.client) return;
    sessionStorage.removeItem(IMPERSONATION);
    localStorage.setItem(ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH, refreshToken);
  },
  setImpersonation(session: ImpersonationSession): void {
    if (!import.meta.client) return;
    sessionStorage.setItem(IMPERSONATION, JSON.stringify(session));
  },
  clearImpersonation(): void {
    if (!import.meta.client) return;
    sessionStorage.removeItem(IMPERSONATION);
  },
  clear(): void {
    if (!import.meta.client) return;
    sessionStorage.removeItem(IMPERSONATION);
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
