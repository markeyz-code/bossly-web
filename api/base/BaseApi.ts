import { http } from '~/config/axios';
import type { ApiEnvelope, Paginated } from '~/types';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export class BaseApi {
  constructor(protected readonly endpoint: string) {}

  protected async request<T>(method: 'get' | 'post' | 'patch' | 'put' | 'delete', path = '', payload?: unknown, params?: Record<string, unknown>, config?: Record<string, unknown>): Promise<T> {
    const response = await http().request<ApiEnvelope<T>>({
      method,
      url: `${this.endpoint}${path}`,
      data: payload,
      params,
      ...(config || {}),
    });
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && body.success === true) return body.data;
    return body as unknown as T;
  }

  list<T>(params?: ListParams): Promise<Paginated<T>> {
    return this.request<Paginated<T>>('get', '', undefined, params as Record<string, unknown>);
  }

  get<T>(id: string): Promise<T> {
    return this.request<T>('get', `/${id}`);
  }

  create<T>(payload: unknown): Promise<T> {
    return this.request<T>('post', '', payload);
  }

  update<T>(id: string, payload: unknown): Promise<T> {
    return this.request<T>('patch', `/${id}`, payload);
  }

  remove<T = { deleted: boolean }>(id: string): Promise<T> {
    return this.request<T>('delete', `/${id}`);
  }

  async downloadBlob(path: string, params?: Record<string, unknown>): Promise<Blob> {
    const response = await http().get(`${this.endpoint}${path}`, { params, responseType: 'blob' });
    return response.data as Blob;
  }
}
