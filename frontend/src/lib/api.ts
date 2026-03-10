const API_BASE = '/api';

// Retry config
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 15000; // 15s

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If server returned HTML (likely Next.js error page) instead of JSON
    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      throw new Error('Server is temporarily unavailable. Please try again.');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Identify retryable errors (network failures, timeouts, 5xx)
    const isRetryable =
      error.name === 'AbortError' ||
      error.message === 'Failed to fetch' ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('temporarily unavailable');

    if (isRetryable && retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchApi<T>(endpoint, options, retries - 1);
    }

    // Provide user-friendly error messages
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }

    throw error;
  }
}

// Auth
export const api = {
  auth: {
    register: (body: any) =>
      fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      fetchApi<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    me: () => fetchApi<{ success: boolean; user: any }>('/auth/me'),
    update: (body: any) =>
      fetchApi<{ success: boolean; user: any; data?: any }>('/auth/update', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  events: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<any>(`/events${query}`);
    },
    featured: () => fetchApi<any>('/events/featured'),
    trending: () => fetchApi<any>('/events/trending'),
    upcoming: () => fetchApi<any>('/events/upcoming'),
    live: () => fetchApi<any>('/events/live'),
    recommended: () => fetchApi<any>('/events/recommended'),
    map: () => fetchApi<any>('/events/map'),
    my: () => fetchApi<any>('/events/my'),
    get: (id: string) => fetchApi<any>(`/events/${id}`),
    getBySlug: (slug: string) => fetchApi<any>(`/events/slug/${slug}`),
    create: (formData: FormData) =>
      fetchApi<any>('/events', { method: 'POST', body: formData }),
    update: (id: string, formData: FormData) =>
      fetchApi<any>(`/events/${id}`, { method: 'PUT', body: formData }),
    delete: (id: string) =>
      fetchApi<any>(`/events/${id}`, { method: 'DELETE' }),
    toggleRegistration: (id: string) =>
      fetchApi<any>(`/events/${id}/toggle-registration`, { method: 'PUT' }),
  },

  registrations: {
    register: (eventId: string, body: any) =>
      fetchApi<any>(`/registrations/${eventId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    eventRegistrations: (eventId: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<any>(`/registrations/event/${eventId}${query}`);
    },
    my: () => fetchApi<any>('/registrations/my'),
    verify: (body: { registrationId: string; eventId: string }) =>
      fetchApi<any>('/registrations/verify', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    pass: (registrationId: string) =>
      fetchApi<any>(`/registrations/pass/${registrationId}`),
    exportData: (eventId: string, format: 'csv' | 'json' = 'json') =>
      fetchApi<any>(`/registrations/export/${eventId}?format=${format}`),
    exportCsvUrl: (eventId: string) => `${API_BASE}/registrations/export/${eventId}`,
  },

  admin: {
    stats: () => fetchApi<any>('/admin/stats'),
    events: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<any>(`/admin/events${query}`);
    },
    approve: (id: string) =>
      fetchApi<any>(`/admin/events/${id}/approve`, { method: 'PUT' }),
    publish: (id: string) =>
      fetchApi<any>(`/admin/events/${id}/publish`, { method: 'PUT' }),
    reject: (id: string) =>
      fetchApi<any>(`/admin/events/${id}/reject`, { method: 'PUT' }),
    feature: (id: string) =>
      fetchApi<any>(`/admin/events/${id}/feature`, { method: 'PUT' }),
    users: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<any>(`/admin/users${query}`);
    },
  },

  analytics: {
    overview: () => fetchApi<any>('/analytics/overview'),
    events: () => fetchApi<any>('/analytics/events'),
    departments: () => fetchApi<any>('/analytics/departments'),
    categories: () => fetchApi<any>('/analytics/categories'),
    event: (id: string) => fetchApi<any>(`/analytics/event/${id}`),
  },

  notifications: {
    list: () => fetchApi<any>('/notifications'),
    read: (id: string) =>
      fetchApi<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  },

  bookmarks: {
    toggle: (eventId: string) =>
      fetchApi<any>(`/bookmarks/${eventId}`, { method: 'POST' }),
    list: () => fetchApi<any>('/bookmarks'),
    check: (eventId: string) =>
      fetchApi<any>(`/bookmarks/check/${eventId}`),
    remove: (eventId: string) =>
      fetchApi<any>(`/bookmarks/${eventId}`, { method: 'DELETE' }),
  },

  payments: {
    initiate: (registrationId: string) =>
      fetchApi<any>('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ registrationId }),
      }),
    confirm: (paymentId: string, method: string) =>
      fetchApi<any>('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentId, method }),
      }),
    getByRegistration: (registrationId: string) =>
      fetchApi<any>(`/payments/registration/${registrationId}`),
    my: () => fetchApi<any>('/payments/my'),
    eventPayments: (eventId: string) =>
      fetchApi<any>(`/payments/event/${eventId}`),
  },
};
