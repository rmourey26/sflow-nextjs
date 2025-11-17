import { Platform } from 'react-native';

import { log } from '@/lib/logger';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  path: string;
  method?: HttpMethod;
  data?: Record<string, unknown> | FormData;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const defaultBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_DEV_API_URL ??
  (Platform.OS === 'web' ? window.location.origin : 'http://localhost:3000');

export async function apiRequest<T>({
  path,
  method = 'GET',
  data,
  query,
  headers,
  signal,
}: RequestOptions): Promise<T> {
  const url = new URL(path, defaultBaseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const baseHeaders: Record<string, string> = {
    ...(headers ?? {}),
  };

  if (!isFormData && method !== 'GET') {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), {
    method,
    headers: baseHeaders,
    body: method === 'GET' ? undefined : isFormData ? (data as FormData) : JSON.stringify(data ?? {}),
    signal,
  });

  const contentType = response.headers.get('content-type');
  let payload: unknown;

  if (contentType?.includes('application/json')) {
    payload = await response.json();
  } else if (contentType?.includes('text/')) {
    payload = await response.text();
  }

  if (!response.ok) {
    log('warn', 'API request failed', { path, status: response.status, payload });
    throw new ApiError(response.statusText, response.status, payload);
  }

  return payload as T;
}
