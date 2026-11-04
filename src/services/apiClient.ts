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

// ==========================================
// Full-Stack REST API Helpers for AppContext
// ==========================================

export const api = {
  // Settings
  async getSettings() {
    return await apiRequest('/api/settings', { method: 'GET' });
  },
  async updateSettings(settings: any) {
    return await apiRequest('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Courses
  async getCourses() {
    return await apiRequest('/api/courses', { method: 'GET' });
  },
  async createCourse(course: any) {
    return await apiRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  },
  async updateCourse(id: string, course: any) {
    return await apiRequest(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(course),
    });
  },
  async deleteCourse(id: string) {
    return await apiRequest(`/api/courses/${id}`, { method: 'DELETE' });
  },

  // Products
  async getProducts() {
    return await apiRequest('/api/products', { method: 'GET' });
  },
  async createProduct(product: any) {
    return await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  async updateProduct(id: string, product: any) {
    return await apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  async deleteProduct(id: string) {
    return await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
  },

  // Students & Enrollments
  async getStudents() {
    return await apiRequest('/api/students', { method: 'GET' });
  },
  async publicEnroll(studentData: any) {
    return await apiRequest('/api/students/public-enroll', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },
  async createStudent(studentData: any) {
    return await apiRequest('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },
  async updateStudent(id: string, studentData: any) {
    return await apiRequest(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },
  async deleteStudent(id: string) {
    return await apiRequest(`/api/students/${id}`, { method: 'DELETE' });
  },
  async enrollStudent(studentId: string, enrollmentData: any) {
    return await apiRequest(`/api/students/${studentId}/enroll`, {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  },
  async updateEnrollment(studentId: string, enrollmentId: string, fields: any) {
    return await apiRequest(`/api/students/${studentId}/enrollments/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
  },
  async deleteEnrollment(studentId: string, enrollmentId: string) {
    return await apiRequest(`/api/students/${studentId}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders() {
    return await apiRequest('/api/orders', { method: 'GET' });
  },
  async createOrder(orderData: any) {
    return await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  async updateOrderStatus(id: string, status: string) {
    return await apiRequest(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  async deleteOrder(id: string) {
    return await apiRequest(`/api/orders/${id}`, { method: 'DELETE' });
  },

  // FAQs
  async getFaqs() {
    return await apiRequest('/api/faqs', { method: 'GET' });
  },
  async createFaq(faq: any) {
    return await apiRequest('/api/faqs', {
      method: 'POST',
      body: JSON.stringify(faq),
    });
  },
  async updateFaq(id: string, faq: any) {
    return await apiRequest(`/api/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faq),
    });
  },
  async deleteFaq(id: string) {
    return await apiRequest(`/api/faqs/${id}`, { method: 'DELETE' });
  },

  // Public Inquiry
  async searchInquiry(queryTerm: string) {
    return await apiRequest(`/api/inquiry?q=${encodeURIComponent(queryTerm)}`, {
      method: 'GET',
    });
  },
};
