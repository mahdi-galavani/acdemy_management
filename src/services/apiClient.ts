const TOKEN_KEY = 'fandoq_admin_jwt_token';
export const AUTH_EXPIRED_EVENT = 'fandoq-auth-expired';
export const authStorage = {
  getToken(): string | null { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  setToken(token: string): void { sessionStorage.setItem(TOKEN_KEY, token); localStorage.removeItem(TOKEN_KEY); },
  clearToken(): void { try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); } catch {} },
};
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = authStorage.getToken();
    const response = await fetch(endpoint, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      signal: options.signal || AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      if (response.status === 401 && token === authStorage.getToken()) {
        authStorage.clearToken();
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
      return { success: false, error: result.error || 'ارتباط با سرور برقرار نشد.' };
    }
    return { success: true, data: result };
  } catch {
    return { success: false, error: 'پاسخ معتبری از سرور دریافت نشد. اتصال را بررسی کنید؛ در صورت ثبت سفارش، پیش از تکرار وضعیت آن را پیگیری کنید.' };
  }
}
export const checkServerHealth = () => apiRequest('/api/health');
export async function loginAdmin(username: string, password: string) {
  const result = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (result.success && result.data?.token) {
    try { authStorage.setToken(result.data.token); }
    catch { return { success: false, error: 'مرورگر اجازه ذخیره نشست ورود را نمی‌دهد.' }; }
  }
  return result;
}
