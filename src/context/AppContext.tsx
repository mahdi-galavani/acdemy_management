import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Course,
  Student,
  CourseEnrollment,
  StudentStatus,
  Product,
  Order,
  FAQItem,
  CartItem,
  OrderStatus,
  PaymentStatus,
  SiteSettings
} from '../types';
import { INITIAL_SITE_SETTINGS } from '../data/initialData';
import { apiRequest, authStorage, AUTH_EXPIRED_EVENT } from '../services/apiClient';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  isAuthenticated: boolean;
  authLoading: boolean;
  isSaving: boolean;
  dataLoading: boolean;
  serverError: string | null;
  dbStatus: { connected: boolean; type: string } | null;
  refreshData: () => Promise<boolean>;
  verifySession: () => Promise<boolean>;
  logout: () => void;
  registerStudent: (data: any) => Promise<boolean>;
  // Navigation & UI state
  currentView: 'landing' | 'admin';
  setCurrentView: (view: 'landing' | 'admin') => void;
  activeAdminTab: 'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'site_settings' | 'settings';
  setActiveAdminTab: (tab: 'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'site_settings' | 'settings') => void;
  
  // Modals & Drawers
  selectedCourseForDetail: Course | null;
  setSelectedCourseForDetail: (course: Course | null) => void;
  selectedProductForOrder: Product | null;
  setSelectedProductForOrder: (product: Product | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  
  // Data state
  siteSettings: SiteSettings;
  courses: Course[];
  students: Student[];
  products: Product[];
  orders: Order[];
  faqs: FAQItem[];
  cart: CartItem[];
  toasts: Toast[];

  // Site settings actions
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;

  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => Promise<boolean>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;

  // Student actions
  addStudent: (student: {
    fullName: string;
    phone: string;
    nationalCode?: string;
    email?: string;
    courseId: string;
    courseTitle: string;
    tuitionTotal: number;
    tuitionPaid: number;
    paymentStatus?: PaymentStatus;
    certificateIssued?: boolean;
    status?: StudentStatus;
    notes?: string;
  }) => Promise<boolean>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  enrollStudentInCourse: (studentId: string, enrollmentData: {
    courseId: string;
    courseTitle: string;
    tuitionTotal: number;
    tuitionPaid: number;
    paymentStatus?: PaymentStatus;
    notes?: string;
  }) => Promise<boolean>;
  updateStudentEnrollment: (studentId: string, enrollmentId: string, updatedFields: Partial<CourseEnrollment>) => Promise<boolean>;
  deleteStudentEnrollment: (studentId: string, enrollmentId: string) => Promise<boolean>;

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Order actions
  createOrder: (customerData: { name: string; phone: string; address: string; deliveryDate: string; notes?: string }) => Promise<string | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;

  // FAQ actions
  addFaq: (faq: Omit<FAQItem, 'id' | 'order'>) => Promise<boolean>;
  updateFaq: (id: string, faq: Partial<FAQItem>) => Promise<boolean>;
  deleteFaq: (id: string) => Promise<boolean>;

  // Cart actions
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQty: (cartItemId: string, delta: number) => void;
  clearCart: () => void;

  // System actions
  resetAllData: () => Promise<boolean>;
  exportDataJson: () => Promise<boolean>;
  importDataJson: (jsonString: string) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const CART_KEY = 'fandoq_cart_v1';
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');
  const [activeAdminTab, setActiveAdminTab] = useState<AppContextType['activeAdminTab']>('overview');
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [siteSettings, setSiteSettings] = useState(INITIAL_SITE_SETTINGS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => { try { const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; } });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authenticated = useRef(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<AppContextType['dbStatus']>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const requestVersion = useRef(0);
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const logout = useCallback(() => {
    authStorage.clearToken(); authenticated.current = false; setIsAuthenticated(false);
    setStudents([]); setOrders([]); requestVersion.current++;
  }, []);
  const refreshData = useCallback(async () => {
    const version = ++requestVersion.current;
    const token = authStorage.getToken();
    const [publicData, privateData, health] = await Promise.all([
      apiRequest('/api/bootstrap'),
      authenticated.current ? apiRequest('/api/admin/data') : Promise.resolve(null),
      apiRequest('/api/health'),
    ]);
    if (version !== requestVersion.current) return false;
    setDataLoading(false);
    setDbStatus(health.success ? health.data.database : null);
    if (!publicData.success || (privateData && !privateData.success)) {
      setServerError(publicData.error || privateData?.error || 'دریافت اطلاعات انجام نشد.');
      return false;
    }
    const data = publicData.data;
    setCourses(data.courses); setProducts(data.products); setFaqs(data.faqs); setSiteSettings(data.siteSettings);
    if (authenticated.current && token === authStorage.getToken() && privateData?.success) { setStudents(privateData.data.students); setOrders(privateData.data.orders); }
    setServerError(null);
    return true;
  }, []);
  const verifySession = useCallback(async () => {
    setAuthLoading(true);
    let valid = false;
    if (authStorage.getToken()) {
      const result = await apiRequest('/api/auth/me'); valid = result.success;
      if (!valid) logout();
    }
    authenticated.current = valid; setIsAuthenticated(valid); setAuthLoading(false);
    await refreshData(); return valid;
  }, [logout, refreshData]);
  useEffect(() => {
    void verifySession();
    const expired = () => { logout(); showToast('نشست ورود پایان یافته است. دوباره وارد شوید.', 'error'); };
    window.addEventListener(AUTH_EXPIRED_EVENT, expired);
    const timer = setInterval(() => { if (!saving.current && !document.hidden) void refreshData(); }, 15000);
    return () => { clearInterval(timer); window.removeEventListener(AUTH_EXPIRED_EVENT, expired); requestVersion.current++; };
  }, [verifySession, refreshData, logout, showToast]);
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { showToast('ذخیره سبد در مرورگر ممکن نیست.', 'error'); } }, [cart, showToast]);

  async function perform<T>(work: () => Promise<T>, message?: string): Promise<T | null> {
    if (saving.current) return null;
    saving.current = true; setIsSaving(true);
    requestVersion.current++;
    try {
      const result = await work();
      if (message) showToast(message);
      return result;
    } catch (error) { showToast(error instanceof Error ? error.message : 'عملیات انجام نشد.', 'error'); return null; }
    finally { saving.current = false; setIsSaving(false); }
  }
  async function request(endpoint: string, method = 'GET', body?: unknown) {
    const result = await apiRequest(endpoint, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
  const mutate = async (path: string, method: string, body?: unknown): Promise<boolean> => Boolean(await perform(async () => {
    await request(`/api${path}`, method, body);
    const refreshed = await refreshData();
    showToast(refreshed ? 'تغییرات در سرور ذخیره شد.' : 'ذخیره انجام شد، اما دریافت مجدد اطلاعات ناموفق بود.', refreshed ? 'success' : 'info');
    return true;
  }));
  const updateSiteSettings = (data: Partial<SiteSettings>) => mutate('/settings', 'PUT', data);
  const addCourse = (data: Omit<Course, 'id'>) => mutate('/courses', 'POST', data);
  const updateCourse = (id: string, data: Partial<Course>) => mutate(`/courses/${id}`, 'PUT', data);
  const deleteCourse = (id: string) => mutate(`/courses/${id}`, 'DELETE');
  const addStudent: AppContextType['addStudent'] = data => mutate('/students', 'POST', data);
  const registerStudent = (data: any) => mutate('/registrations', 'POST', data);
  const updateStudent = (id: string, data: Partial<Student>) => mutate(`/students/${id}`, 'PUT', data);
  const deleteStudent = (id: string) => mutate(`/students/${id}`, 'DELETE');
  const enrollStudentInCourse: AppContextType['enrollStudentInCourse'] = (id, data) => mutate(`/students/${id}/enroll`, 'POST', data);
  const updateStudentEnrollment: AppContextType['updateStudentEnrollment'] = (id, enrollmentId, data) => mutate(`/students/${id}/enrollments/${enrollmentId}`, 'PUT', data);
  const deleteStudentEnrollment: AppContextType['deleteStudentEnrollment'] = (id, enrollmentId) => mutate(`/students/${id}/enrollments/${enrollmentId}`, 'DELETE');
  const addProduct = (data: Omit<Product, 'id'>) => mutate('/products', 'POST', data);
  const updateProduct = (id: string, data: Partial<Product>) => mutate(`/products/${id}`, 'PUT', data);
  const deleteProduct = (id: string) => mutate(`/products/${id}`, 'DELETE');
  const addFaq: AppContextType['addFaq'] = data => mutate('/faqs', 'POST', { ...data, order: faqs.length });
  const updateFaq = (id: string, data: Partial<FAQItem>) => mutate(`/faqs/${id}`, 'PUT', data);
  const deleteFaq = (id: string) => mutate(`/faqs/${id}`, 'DELETE');
  const updateOrderStatus = (id: string, status: OrderStatus) => mutate(`/orders/${id}/status`, 'PATCH', { status });
  const deleteOrder = (id: string) => mutate(`/orders/${id}`, 'DELETE');
  const addToCart = (item: Omit<CartItem, 'id'>) => { setCart(prev => [...prev, { ...item, id: crypto.randomUUID() }]); setIsCartDrawerOpen(true); };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const updateCartItemQty = (id: string, delta: number) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + delta, totalPrice: item.unitPrice * (item.product.isPerKg ? item.weightKg || 1 : 1) * (item.quantity + delta) } : item).filter(item => item.quantity > 0));
  const clearCart = () => setCart([]);
  const createOrder: AppContextType['createOrder'] = data => perform(async () => {
    const result = await request('/api/orders', 'POST', { customerName: data.name, customerPhone: data.phone, deliveryAddress: data.address, deliveryDate: data.deliveryDate, notes: data.notes, items: cart.map(({ productId, quantity, weightKg, selectedFilling, cakeText, specialNotes }) => ({ productId, quantity, weightKg, selectedFilling, cakeText, specialNotes })) });
    clearCart(); await refreshData();
    return result.orderNumber as string;
  }, 'سفارش در سرور ثبت شد.');
  const resetAllData = () => mutate('/reset', 'POST');
  const exportDataJson = async () => Boolean(await perform(async () => {
    const result = await request('/api/backup');
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.backup, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `fandoq-backup-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); return true;
  }));
  const importDataJson = async (json: string) => {
    let data: unknown;
    try { data = JSON.parse(json); } catch { showToast('فایل JSON معتبر نیست.', 'error'); return false; }
    return mutate('/backup', 'PUT', data);
  };
  return (
    <AppContext.Provider value={{ currentView, setCurrentView, activeAdminTab, setActiveAdminTab, selectedCourseForDetail, setSelectedCourseForDetail, selectedProductForOrder, setSelectedProductForOrder, isCartDrawerOpen, setIsCartDrawerOpen, siteSettings, courses, students, products, orders, faqs, cart, toasts, updateSiteSettings, addCourse, updateCourse, deleteCourse, addStudent, registerStudent, updateStudent, deleteStudent, enrollStudentInCourse, updateStudentEnrollment, deleteStudentEnrollment, addProduct, updateProduct, deleteProduct, createOrder, updateOrderStatus, deleteOrder, addFaq, updateFaq, deleteFaq, addToCart, removeFromCart, updateCartItemQty, clearCart, resetAllData, exportDataJson, importDataJson, showToast, isAuthenticated, authLoading, isSaving, dataLoading, serverError, dbStatus, refreshData, verifySession, logout }}>
      {children}
      <div className="fixed bottom-5 left-5 z-[100] flex flex-col gap-2 max-w-sm w-full" aria-live="polite">
        {toasts.map(toast => <div key={toast.id} className={`p-4 rounded-xl shadow-lg text-white text-sm ${toast.type === 'error' ? 'bg-rose-900' : toast.type === 'info' ? 'bg-stone-800' : 'bg-emerald-900'}`}>{toast.message}</div>)}
      </div>
    </AppContext.Provider>
  );
};
export const useApp = () => { const context = useContext(AppContext); if (!context) throw new Error('useApp must be used within AppProvider'); return context; };
