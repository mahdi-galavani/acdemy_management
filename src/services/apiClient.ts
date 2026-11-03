/**
 * Fandoq Academy & Confectionery - Backend API Client
 * Manages JWT tokens, authenticated requests, and PostgreSQL synchronization
 */

const TOKEN_KEY = 'fandoq_admin_jwt_token';

export const authStorage = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string, persist = true): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch {
      // ignore storage quota errors
    }
  },
  clearToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

/**
 * Perform authenticated or public API requests to /api/*
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = authStorage.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 401 Unauthorized, clear stale token
      if (response.status === 401) {
        authStorage.clearToken();
      }
      return {
        success: false,
        error: result.error || `خطای سرور: ${response.status}`,
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'خطای برقراری ارتباط با سرور',
    };
  }
}

/**
 * Health check helper
 */
export async function checkServerHealth() {
  return await apiRequest('/api/health', { method: 'GET' });
}

/**
 * Admin Login Helper
 */
export async function loginAdmin(username: string, password: string) {
  const res = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (res.success && res.data?.token) {
    authStorage.setToken(res.data.token);
  }
  return res;
}
