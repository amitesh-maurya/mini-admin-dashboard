import axios from 'axios';

const baseUrlRaw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Automatically append /api if it's missing to prevent 404 errors
const baseURL = baseUrlRaw.endsWith('/api') ? baseUrlRaw : `${baseUrlRaw.replace(/\/$/, '')}/api`;

// ─── Token storage helpers ────────────────────────────────────────────────────
// Stored in localStorage so the token survives page refreshes.
// The token is also sent as a cookie (httpOnly) by the server for same-origin fallback.
const TOKEN_KEY = 'accessToken';

export const getStoredToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export const setStoredToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const removeStoredToken = (): void =>
  localStorage.removeItem(TOKEN_KEY);

// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL,
  withCredentials: true, // still send cookies as fallback for same-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach the stored access token as Authorization Bearer header.
// This is the primary auth mechanism for cross-origin (Vercel + Render) deployments.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether a token refresh is already in-flight so concurrent 401s don't
// each trigger their own /refresh call.
let isRefreshing = false;
let pendingQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

const flushQueue = (err: unknown) => {
  pendingQueue.forEach((p) => (err ? p.reject(err) : p.resolve()));
  pendingQueue = [];
};

// Response interceptor: on 401 try to refresh the access token before giving up
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request and only for 401s that aren't
    // coming from the refresh/login/register endpoints themselves.
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;

      if (isRefreshing) {
        // Queue this request until the refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await api.post('/auth/refresh');
        // Update the stored token if the server returns a new one in the response body
        const newToken: string | undefined = refreshRes.data?.accessToken;
        if (newToken) setStoredToken(newToken);
        flushQueue(null);
        return api(originalRequest); // retry the original request
      } catch (refreshError) {
        flushQueue(refreshError);
        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (pathname !== '/login' && pathname !== '/register') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
