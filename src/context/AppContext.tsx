import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Student, Product, Order, FAQItem, CartItem, OrderStatus, PaymentStatus } from '../types';
import { INITIAL_COURSES, INITIAL_PRODUCTS, INITIAL_STUDENTS, INITIAL_ORDERS, INITIAL_FAQS } from '../data/initialData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Navigation & UI state
  currentView: 'landing' | 'admin';
  setCurrentView: (view: 'landing' | 'admin') => void;
  activeAdminTab: 'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'settings';
  setActiveAdminTab: (tab: 'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'settings') => void;
  
  // Modals & Drawers
  selectedCourseForDetail: Course | null;
  setSelectedCourseForDetail: (course: Course | null) => void;
  selectedProductForOrder: Product | null;
  setSelectedProductForOrder: (product: Product | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  
  // Data state
  courses: Course[];
  students: Student[];
  products: Product[];
  orders: Order[];
  faqs: FAQItem[];
  cart: CartItem[];
  toasts: Toast[];

  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'registrationDate'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

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
  COURSES: 'fandoq_courses_v1',
  STUDENTS: 'fandoq_students_v1',
  PRODUCTS: 'fandoq_products_v1',
  ORDERS: 'fandoq_orders_v1',
  FAQS: 'fandoq_faqs_v1',
  CART: 'fandoq_cart_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'settings'>('overview');
  
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  // Save to localStorage
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
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Course handlers
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    showToast(`دوره «${newCourse.title}» با موفقیت اضافه شد.`);
  };

  const updateCourse = (id: string, updatedFields: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    showToast('اطلاعات دوره با موفقیت به‌روزرسانی شد.');
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    showToast('دوره با موفقیت حذف شد.', 'info');
  };

  // Student handlers
  const addStudent = (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    const dateStr = new Date().toLocaleDateString('fa-IR');
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      registrationDate: dateStr,
    };
    setStudents((prev) => [newStudent, ...prev]);

    // increment enrolledCount in corresponding course
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === newStudent.courseId) {
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
    showToast(`هنرجو «${newStudent.fullName}» در دوره ثبت نام شد.`);
  };

  const updateStudent = (id: string, updatedFields: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast('اطلاعات هنرجو ویرایش گردید.');
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('هنرجو از سامانه حذف شد.', 'info');
  };

  // Product handlers
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`محصول «${newProduct.title}» به منو افزوده شد.`);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast('اطلاعات محصول به‌روزرسانی شد.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
    showToast(`سفارش شماره ${orderNumber} با موفقیت ثبت شد! به زودی تماس خواهیم گرفت.`);
    return orderNumber;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    showToast('وضعیت سفارش تغییر یافت.');
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
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
    showToast('سوال متداول جدید افزوده شد.');
  };

  const updateFaq = (id: string, updatedFields: Partial<FAQItem>) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updatedFields } : f))
    );
    showToast('پرسش و پاسخ ویرایش شد.');
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    showToast('پرسش متداول حذف شد.', 'info');
  };

  // System actions
  const resetAllData = () => {
    setCourses(INITIAL_COURSES);
    setStudents(INITIAL_STUDENTS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setFaqs(INITIAL_FAQS);
    setCart([]);
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
        courses,
        students,
        products,
        orders,
        faqs,
        cart,
        toasts,
        addCourse,
        updateCourse,
        deleteCourse,
        addStudent,
        updateStudent,
        deleteStudent,
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
