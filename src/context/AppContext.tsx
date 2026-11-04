import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { INITIAL_COURSES, INITIAL_PRODUCTS, INITIAL_STUDENTS, INITIAL_ORDERS, INITIAL_FAQS, INITIAL_SITE_SETTINGS } from '../data/initialData';
import { api, checkServerHealth, authStorage } from '../services/apiClient';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
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

  // Full-Stack Synchronization
  syncWithBackend: () => Promise<void>;
  isBackendConnected: boolean;
  dbType: 'postgresql' | 'in_memory_fallback' | 'offline_client';
  isSyncing: boolean;

  // Site settings actions
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => void;

  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

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
  }) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  enrollStudentInCourse: (studentId: string, enrollmentData: {
    courseId: string;
    courseTitle: string;
    tuitionTotal: number;
    tuitionPaid: number;
    paymentStatus?: PaymentStatus;
    notes?: string;
  }) => void;
  updateStudentEnrollment: (studentId: string, enrollmentId: string, updatedFields: Partial<CourseEnrollment>) => void;
  deleteStudentEnrollment: (studentId: string, enrollmentId: string) => void;

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Order actions
  createOrder: (customerData: { name: string; phone: string; address: string; deliveryDate: string; notes?: string }) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // FAQ actions
  addFaq: (faq: Omit<FAQItem, 'id' | 'order'>) => void;
  updateFaq: (id: string, faq: Partial<FAQItem>) => void;
  deleteFaq: (id: string) => void;

  // Cart actions
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQty: (cartItemId: string, delta: number) => void;
  clearCart: () => void;

  // System actions
  resetAllData: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SITE_SETTINGS: 'fandoq_site_settings_v1',
  COURSES: 'fandoq_courses_v1',
  STUDENTS: 'fandoq_students_v1',
  PRODUCTS: 'fandoq_products_v1',
  ORDERS: 'fandoq_orders_v1',
  FAQS: 'fandoq_faqs_v1',
  CART: 'fandoq_cart_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'site_settings' | 'settings'>('overview');
  
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Backend connection & synchronization state
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [dbType, setDbType] = useState<'postgresql' | 'in_memory_fallback' | 'offline_client'>('offline_client');
  const [isSyncing, setIsSyncing] = useState(false);

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
      return saved ? { ...INITIAL_SITE_SETTINGS, ...JSON.parse(saved) } : INITIAL_SITE_SETTINGS;
    } catch {
      return INITIAL_SITE_SETTINGS;
    }
  });

  // Courses state
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  // Students state
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // FAQs state
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAQS);
      return saved ? JSON.parse(saved) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage as offline cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Full synchronization with backend PostgreSQL API
  const syncWithBackend = useCallback(async () => {
    setIsSyncing(true);
    try {
      const health = await checkServerHealth();
      if (health.success && health.data?.database) {
        setIsBackendConnected(true);
        setDbType(health.data.database.type);
      } else {
        setIsBackendConnected(false);
        setDbType('offline_client');
      }

      // 1. Fetch public site settings
      const settingsRes = await api.getSettings();
      if (settingsRes.success && settingsRes.data?.settings) {
        setSiteSettings(settingsRes.data.settings);
      }

      // 2. Fetch public courses
      const coursesRes = await api.getCourses();
      if (coursesRes.success && coursesRes.data?.courses && coursesRes.data.courses.length > 0) {
        setCourses(coursesRes.data.courses);
      }

      // 3. Fetch public products
      const productsRes = await api.getProducts();
      if (productsRes.success && productsRes.data?.products && productsRes.data.products.length > 0) {
        setProducts(productsRes.data.products);
      }

      // 4. Fetch public FAQs
      const faqsRes = await api.getFaqs();
      if (faqsRes.success && faqsRes.data?.faqs && faqsRes.data.faqs.length > 0) {
        setFaqs(faqsRes.data.faqs);
      }

      // 5. Fetch authenticated data if logged in
      if (authStorage.isAuthenticated()) {
        const studentsRes = await api.getStudents();
        if (studentsRes.success && studentsRes.data?.students) {
          setStudents(studentsRes.data.students);
        }

        const ordersRes = await api.getOrders();
        if (ordersRes.success && ordersRes.data?.orders) {
          setOrders(ordersRes.data.orders);
        }
      }
    } catch (err) {
      console.warn('Backend sync failed, continuing with local storage:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on application initial mount
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const updateSiteSettings = (newFields: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...newFields }));
    api.updateSettings(newFields).catch((err) => console.warn('API updateSettings sync note:', err));
    showToast('تنظیمات عمومی سایت با موفقیت به‌روزرسانی و در پایگاه داده ذخیره شد.');
  };

  // Course handlers
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    api.createCourse(newCourse).catch((err) => console.warn('API createCourse sync note:', err));
    showToast(`دوره «${newCourse.title}» با موفقیت اضافه شد.`);
  };

  const updateCourse = (id: string, updatedFields: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    api.updateCourse(id, updatedFields).catch((err) => console.warn('API updateCourse sync note:', err));
    showToast('اطلاعات دوره با موفقیت به‌روزرسانی شد.');
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    api.deleteCourse(id).catch((err) => console.warn('API deleteCourse sync note:', err));
    showToast('دوره با موفقیت حذف شد.', 'info');
  };

  // Student handlers
  const addStudent = (studentData: {
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
  }) => {
    const dateStr = new Date().toLocaleDateString('fa-IR');
    const cleanPhone = studentData.phone.trim();
    
    // Check if a student with the same phone already exists
    const existingIndex = students.findIndex((s) => s.phone.trim() === cleanPhone);

    const newEnrollment: CourseEnrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      courseId: studentData.courseId,
      courseTitle: studentData.courseTitle,
      enrolledAt: dateStr,
      tuitionTotal: studentData.tuitionTotal,
      tuitionPaid: studentData.tuitionPaid,
      paymentStatus: studentData.paymentStatus || (studentData.tuitionPaid >= studentData.tuitionTotal ? 'paid' : studentData.tuitionPaid > 0 ? 'partial' : 'pending'),
      certificateIssued: studentData.certificateIssued || false,
      status: studentData.status || 'active',
      notes: studentData.notes,
    };

    if (existingIndex >= 0) {
      // Append enrollment to existing student
      const existing = students[existingIndex];
      const updatedEnrollments = [...(existing.enrollments || []), newEnrollment];
      const updatedStudent: Student = {
        ...existing,
        fullName: studentData.fullName.trim() || existing.fullName,
        nationalCode: studentData.nationalCode?.trim() || existing.nationalCode,
        email: studentData.email?.trim() || existing.email,
        enrollments: updatedEnrollments,
      };
      setStudents((prev) => prev.map((s, idx) => (idx === existingIndex ? updatedStudent : s)));
      showToast(`دوره «${studentData.courseTitle}» به سوابق هنرجو «${existing.fullName}» اضافه شد.`);
    } else {
      // Create new student
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        fullName: studentData.fullName.trim(),
        nationalCode: studentData.nationalCode?.trim() || '---',
        phone: cleanPhone,
        email: studentData.email?.trim(),
        enrollments: [newEnrollment],
        createdAt: dateStr,
        notes: studentData.notes,
        // Legacy fields for direct display
        courseId: studentData.courseId,
        courseTitle: studentData.courseTitle,
        registrationDate: dateStr,
        paymentStatus: newEnrollment.paymentStatus,
        tuitionTotal: studentData.tuitionTotal,
        tuitionPaid: studentData.tuitionPaid,
        certificateIssued: newEnrollment.certificateIssued,
        status: newEnrollment.status,
      };
      setStudents((prev) => [newStudent, ...prev]);
      showToast(`هنرجوی جدید «${newStudent.fullName}» با موفقیت ثبت نام شد.`);
    }

    // Backend sync: if authenticated use admin create, else use public enrollment
    if (authStorage.isAuthenticated()) {
      api.createStudent(studentData).catch((err) => console.warn('API createStudent sync note:', err));
    } else {
      api.publicEnroll(studentData).catch((err) => console.warn('API publicEnroll sync note:', err));
    }

    // Increment enrolledCount in corresponding course
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === studentData.courseId) {
          const newEnrolled = (c.enrolledCount || 0) + 1;
          return {
            ...c,
            enrolledCount: newEnrolled,
            status: newEnrolled >= c.capacity ? 'full' : c.status,
          };
        }
        return c;
      })
    );
  };

  const enrollStudentInCourse = (
    studentId: string,
    enrollmentData: {
      courseId: string;
      courseTitle: string;
      tuitionTotal: number;
      tuitionPaid: number;
      paymentStatus?: PaymentStatus;
      notes?: string;
    }
  ) => {
    const dateStr = new Date().toLocaleDateString('fa-IR');
    const newEnrollment: CourseEnrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      courseId: enrollmentData.courseId,
      courseTitle: enrollmentData.courseTitle,
      enrolledAt: dateStr,
      tuitionTotal: enrollmentData.tuitionTotal,
      tuitionPaid: enrollmentData.tuitionPaid,
      paymentStatus: enrollmentData.paymentStatus || (enrollmentData.tuitionPaid >= enrollmentData.tuitionTotal ? 'paid' : enrollmentData.tuitionPaid > 0 ? 'partial' : 'pending'),
      certificateIssued: false,
      status: 'active',
      notes: enrollmentData.notes,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const currentList = s.enrollments || [];
          return {
            ...s,
            enrollments: [...currentList, newEnrollment],
          };
        }
        return s;
      })
    );

    api.enrollStudent(studentId, enrollmentData).catch((err) => console.warn('API enrollStudent sync note:', err));

    // Update course count
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === enrollmentData.courseId) {
          const newEnrolled = (c.enrolledCount || 0) + 1;
          return {
            ...c,
            enrolledCount: newEnrolled,
            status: newEnrolled >= c.capacity ? 'full' : c.status,
          };
        }
        return c;
      })
    );

    showToast(`دوره جدید با موفقیت به سوابق هنرجو افزوده شد.`);
  };

  const updateStudentEnrollment = (
    studentId: string,
    enrollmentId: string,
    updatedFields: Partial<CourseEnrollment>
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = (s.enrollments || []).map((enr) =>
            enr.id === enrollmentId ? { ...enr, ...updatedFields } : enr
          );
          return { ...s, enrollments: updated };
        }
        return s;
      })
    );
    api.updateEnrollment(studentId, enrollmentId, updatedFields).catch((err) => console.warn('API updateEnrollment sync note:', err));
    showToast('وضعیت دوره هنرجو به‌روزرسانی شد.');
  };

  const deleteStudentEnrollment = (studentId: string, enrollmentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const filtered = (s.enrollments || []).filter((enr) => enr.id !== enrollmentId);
          return { ...s, enrollments: filtered };
        }
        return s;
      })
    );
    api.deleteEnrollment(studentId, enrollmentId).catch((err) => console.warn('API deleteEnrollment sync note:', err));
    showToast('دوره از سوابق هنرجو حذف شد.', 'info');
  };

  const updateStudent = (id: string, updatedFields: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    api.updateStudent(id, updatedFields).catch((err) => console.warn('API updateStudent sync note:', err));
    showToast('اطلاعات پرونده هنرجو ویرایش گردید.');
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    api.deleteStudent(id).catch((err) => console.warn('API deleteStudent sync note:', err));
    showToast('پرونده هنرجو از سامانه حذف شد.', 'info');
  };

  // Product handlers
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    api.createProduct(newProduct).catch((err) => console.warn('API createProduct sync note:', err));
    showToast(`محصول «${newProduct.title}» به منو افزوده شد.`);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    api.updateProduct(id, updatedFields).catch((err) => console.warn('API updateProduct sync note:', err));
    showToast('اطلاعات محصول به‌روزرسانی شد.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    api.deleteProduct(id).catch((err) => console.warn('API deleteProduct sync note:', err));
    showToast('محصول از لیست حذف شد.', 'info');
  };

  // Cart handlers
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCart((prev) => [...prev, newItem]);
    showToast(`«${newItem.product.title}» به سبد سفارشات اضافه شد.`);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('آیتم از سبد حذف شد.', 'info');
  };

  const updateCartItemQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * (item.weightKg || 1) * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order creation
  const createOrder = (customerData: {
    name: string;
    phone: string;
    address: string;
    deliveryDate: string;
    notes?: string;
  }): string => {
    const orderNumber = `FND-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const dateStr = new Date().toLocaleDateString('fa-IR');

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      deliveryDate: customerData.deliveryDate,
      deliveryAddress: customerData.address,
      items: [...cart],
      totalAmount,
      status: 'pending',
      createdAt: dateStr,
      notes: customerData.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartDrawerOpen(false);

    // Sync order to backend PostgreSQL database
    api.createOrder({
      customerName: customerData.name,
      customerPhone: customerData.phone,
      deliveryDate: customerData.deliveryDate,
      deliveryAddress: customerData.address,
      items: newOrder.items,
      totalAmount,
      notes: customerData.notes,
    }).catch((err) => console.warn('API createOrder sync note:', err));

    showToast(`سفارش شماره ${orderNumber} با موفقیت ثبت شد! به زودی تماس خواهیم گرفت.`);
    return orderNumber;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    api.updateOrderStatus(id, status).catch((err) => console.warn('API updateOrderStatus sync note:', err));
    showToast('وضعیت سفارش تغییر یافت.');
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    api.deleteOrder(id).catch((err) => console.warn('API deleteOrder sync note:', err));
    showToast('سفارش حذف شد.', 'info');
  };

  // FAQ handlers
  const addFaq = (faqData: Omit<FAQItem, 'id' | 'order'>) => {
    const newFaq: FAQItem = {
      ...faqData,
      id: `faq-${Date.now()}`,
      order: faqs.length + 1,
    };
    setFaqs((prev) => [...prev, newFaq]);
    api.createFaq(newFaq).catch((err) => console.warn('API createFaq sync note:', err));
    showToast('سوال متداول جدید افزوده شد.');
  };

  const updateFaq = (id: string, updatedFields: Partial<FAQItem>) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updatedFields } : f))
    );
    api.updateFaq(id, updatedFields).catch((err) => console.warn('API updateFaq sync note:', err));
    showToast('پرسش و پاسخ ویرایش شد.');
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    api.deleteFaq(id).catch((err) => console.warn('API deleteFaq sync note:', err));
    showToast('پرسش متداول حذف شد.', 'info');
  };

  // System actions
  const resetAllData = () => {
    setSiteSettings(INITIAL_SITE_SETTINGS);
    setCourses(INITIAL_COURSES);
    setStudents(INITIAL_STUDENTS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setFaqs(INITIAL_FAQS);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.SITE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.FAQS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    showToast('کلیه اطلاعات به تنظیمات کارخانه آموزشگاه فندق بازنشانی شد.');
  };

  const exportDataJson = () => {
    const data = {
      siteSettings,
      courses,
      students,
      products,
      orders,
      faqs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fandoq-academy-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('فایل پشتیبان JSON با موفقیت دانلود شد.');
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.siteSettings) setSiteSettings(parsed.siteSettings);
      if (parsed.courses) setCourses(parsed.courses);
      if (parsed.students) setStudents(parsed.students);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.faqs) setFaqs(parsed.faqs);
      showToast('داده‌های فایل پشتیبان با موفقیت جایگزین شدند.');
      return true;
    } catch (err) {
      showToast('خطا در خواندن فایل JSON. ساختار فایل نامعتبر است.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeAdminTab,
        setActiveAdminTab,
        selectedCourseForDetail,
        setSelectedCourseForDetail,
        selectedProductForOrder,
        setSelectedProductForOrder,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        siteSettings,
        updateSiteSettings,
        courses,
        students,
        products,
        orders,
        faqs,
        cart,
        toasts,
        syncWithBackend,
        isBackendConnected,
        dbType,
        isSyncing,
        addCourse,
        updateCourse,
        deleteCourse,
        addStudent,
        updateStudent,
        deleteStudent,
        enrollStudentInCourse,
        updateStudentEnrollment,
        deleteStudentEnrollment,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        addFaq,
        updateFaq,
        deleteFaq,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        clearCart,
        resetAllData,
        exportDataJson,
        importDataJson,
        showToast,
      }}
    >
      {children}
      {/* Toast notifications container */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm font-medium backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-stone-900/90 text-white border-stone-700'
                : 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
