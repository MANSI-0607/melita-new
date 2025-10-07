// Centralized API client with auth, base URL and error handling
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE =  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function buildUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_BASE}${path}`;
}

async function request<T>(method: HttpMethod, path: string, body?: any, init?: RequestInit): Promise<T> {
  // Choose token based on route namespace: use admin token only for /admin endpoints
  const adminToken = localStorage.getItem('melita_admin_token');
  const userToken = localStorage.getItem('melita_token');
  const sellerToken = localStorage.getItem('melita_seller_token');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Treat both /admin and /coupons namespaces as admin-protected APIs
  const isAdminPath = ['/admin', '/coupons'].some(p => normalizedPath.startsWith(p));
  const isSellerPath = normalizedPath.startsWith('/sellers');
  const token = isSellerPath ? sellerToken : (isAdminPath ? (adminToken || userToken) : (userToken || adminToken));

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers || {}),
  };

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });

  // Handle 401 by redirecting to login
  if (res.status === 401) {
    try {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || 'Unauthorized');
    } finally {
      // Defer navigation to caller; they can catch and navigate
    }
  }

  const text = await res.text();
  // Some endpoints might return empty body
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg = json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: any, init?: RequestInit) => request<T>('POST', path, body, init),
  put: <T>(path: string, body?: any, init?: RequestInit) => request<T>('PUT', path, body, init),
  patch: <T>(path: string, body?: any, init?: RequestInit) => request<T>('PATCH', path, body, init),
  delete: <T>(path: string, init?: RequestInit) => request<T>('DELETE', path, undefined, init),
  baseUrl: API_BASE,
};
