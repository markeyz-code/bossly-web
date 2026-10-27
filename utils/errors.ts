import type { ApiErrorShape } from '~/types';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(input: ApiErrorShape) {
    super(input.message);
    this.name = 'ApiError';
    this.code = input.code;
    this.status = input.status || 0;
    this.details = input.details;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const maybe = error as {
    response?: { status?: number; data?: { error?: { code?: string; message?: string; details?: unknown } } };
    code?: string;
    message?: string;
  };
  if (maybe?.response?.data?.error) {
    return new ApiError({
      code: maybe.response.data.error.code || 'REQUEST_FAILED',
      message: maybe.response.data.error.message || 'Something went wrong. Please try again.',
      details: maybe.response.data.error.details,
      status: maybe.response.status,
    });
  }
  if (maybe?.code === 'ERR_NETWORK' || maybe?.message?.includes('Network Error')) {
    return new ApiError({ code: 'NETWORK_ERROR', message: 'No network. Your work is safe — we will sync when you are back online.', status: 0 });
  }
  return new ApiError({ code: 'UNKNOWN', message: maybe?.message || 'Something went wrong. Please try again.', status: 0 });
}

export function errorMessage(error: unknown): string {
  return normalizeError(error).message;
}

export function isNetworkError(error: unknown): boolean {
  return normalizeError(error).code === 'NETWORK_ERROR';
}
