import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { normalizeError } from '~/utils/errors';
import { tokenStorage } from '~/utils/auth-storage';

let instance: AxiosInstance | null = null;
let baseUrl = '';
let refreshPromise: Promise<boolean> | null = null;

interface RetryConfig extends InternalAxiosRequestConfig { _retried?: boolean; _networkRetried?: boolean; }

function attachToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Request-Id'] = crypto.randomUUID?.() || `web-${Date.now()}`;
  return config;
}

export function setupHttp(url: string): AxiosInstance {
  baseUrl = url.replace(/\/$/, '');
  instance = axios.create({
    baseURL: baseUrl,
    timeout: 25000,
    headers: { Accept: 'application/json' },
  });

  instance.interceptors.request.use((config) => attachToken(config));

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      const status = error.response?.status;
      const url = config?.url || '';

      if (status === 401 && config && !config._retried && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/platform') && !url.includes('/auth/refresh')) {
        config._retried = true;
        const refreshed = await refreshAccessToken(baseUrl);
        if (refreshed) {
          attachToken(config);
          return instance!.request(config);
        }
        tokenStorage.clear();
        if (import.meta.client) window.dispatchEvent(new CustomEvent('ojaly:session-expired'));
        return Promise.reject(normalizeError(error));
      }

      if (!error.response && config && !config._networkRetried && (config.method || 'get').toLowerCase() === 'get') {
        config._networkRetried = true;
        await new Promise((resolve) => setTimeout(resolve, 450));
        return instance!.request(config);
      }

      return Promise.reject(normalizeError(error));
    },
  );
  return instance;
}

export function http(): AxiosInstance {
  if (!instance) throw new Error('API client has not been initialised.');
  return instance;
}

export function getApiBase(): string {
  return baseUrl;
}

async function refreshAccessToken(url: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) return false;
    try {
      const response = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
        `${url}/auth/refresh`,
        { refreshToken },
        { timeout: 20000, headers: { 'Content-Type': 'application/json' } },
      );
      tokenStorage.set(response.data.data.accessToken, response.data.data.refreshToken);
      if (import.meta.client) window.dispatchEvent(new CustomEvent('ojaly:auth-refreshed'));
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}
