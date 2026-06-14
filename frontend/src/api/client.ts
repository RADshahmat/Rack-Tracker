const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
  credentials?: 'include' | 'omit' | 'same-origin';
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, credentials, ...init } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const headers = new Headers(init.headers);

  // Only set Content-Type if not already set and body is not FormData
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    credentials: credentials || 'include',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
}

export const apiClient = {
  get: <T,>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T,>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),

  put: <T,>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),

  patch: <T,>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),

  delete: <T,>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
