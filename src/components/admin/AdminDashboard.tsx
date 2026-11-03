import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentsManager } from './StudentsManager';
import { CoursesManager } from './CoursesManager';
import { ProductsManager } from './ProductsManager';
import { OrdersManager } from './OrdersManager';
import { FaqManager } from './FaqManager';
import { SettingsManager } from './SettingsManager';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Cake,
  ShoppingBag,
  HelpCircle,
  Settings,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Menu,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setCurrentView,
    students,
    courses,
    products,
    orders,
    faqs,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Overview metrics
  const totalTuition = students.reduce((sum, s) => sum + s.tuitionTotal, 0);
  const totalPaid = students.reduce((sum, s) => sum + s.tuitionPaid, 0);
  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const activeCoursesCount = courses.filter((c) => c.status === 'registering').length;

  interface NavItem {
    id: 'overview' | 'students' | 'courses' | 'products' | 'orders' | 'faqs' | 'settings';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'داشبورد و آمار کلی', icon: LayoutDashboard },
    { id: 'students', label: 'مدیریت هنرجویان', icon: Users, badge: students.length },
    { id: 'courses', label: 'مدیریت دوره‌ها و سرفصل‌ها', icon: GraduationCap, badge: courses.length },
    { id: 'products', label: 'منوی کیک و شیرینی', icon: Cake, badge: products.length },
    { id: 'orders', label: 'سفارشات مشتریان', icon: ShoppingBag, badge: pendingOrdersCount ? `${pendingOrdersCount} جدید` : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'faqs', label: 'پرسش و پاسخ‌ها (FAQ)', icon: HelpCircle, badge: faqs.length },
    { id: 'settings', label: 'پشتیبان‌گیری و دیتابیس', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 text-right">
      
      {/* Mobile Top Header for Admin */}
      <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl text-stone-700 hover:bg-stone-100"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-extrabold text-sm text-stone-900">پنل مدیریت آموزشگاه فندق</span>
        <button
          onClick={() => setCurrentView('landing')}
          className="text-xs text-amber-800 font-bold hover:underline"
        >
          مشاهده سایت
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar Navigation */}
          <aside
            className={`lg:col-span-3 ${
              isMobileSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs sticky top-24 space-y-4">
              
              {/* Academy Identity in Admin */}
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">آموزشگاه فندق</h3>
                  <span className="text-[11px] text-stone-500 font-medium">نسخه مدیریت محلی v1.2</span>
                </div>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-50"
                  title="بازگشت به سایت اصلی"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveAdminTab(item.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            isActive
                              ? 'bg-amber-900 text-amber-100'
                              : item.badgeColor || 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Client View Shortcut */}
              <div className="pt-3 border-t border-stone-100">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="w-full py-2.5 px-3 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مشاهده سایت اصلی</span>
                </button>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            
            {activeAdminTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">پیشخوان مدیریت آموزشگاه و آتلیه فندق</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      خلاصه وضعیت ثبت‌نام هنرجویان، دوره‌ها و سفارشات قنادی
                    </p>
                  </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 mb-2">
                      <span className="text-xs font-semibold">هنرجویان کل</span>
                      <Users className="w-4 h-4 text-amber-800" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-stone-900 tabular-nums">
                        {students.length}
                      </span>
                      <span className="text-xs text-stone-500 mr-1">هنرجو</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium mt-2">
                      {students.filter((s) => s.status === 'active').length} هنرجوی فعال در کلاس‌ها
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 mb-2">
                      <span className="text-xs font-semibold">شهریه دریافتی</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-emerald-800 tabular-nums">
                        {totalPaid.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-[11px] text-stone-500 mr-1">تومان</span>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-2">
                      از کل {totalTuition.toLocaleString('fa-IR')} تومان شهریه
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 mb-2">
                      <span className="text-xs font-semibold">سفارشات کیک و دسر</span>
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-stone-900 tabular-nums">
                        {orders.length}
                      </span>
                      <span className="text-xs text-stone-500 mr-1">سفارش</span>
                    </div>
                    <span className="text-[11px] text-amber-800 font-medium mt-2">
                      {pendingOrdersCount} سفارش جدید در انتظار تایید
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 mb-2">
                      <span className="text-xs font-semibold">دوره‌های در حال ثبت‌نام</span>
                      <GraduationCap className="w-4 h-4 text-amber-800" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-stone-900 tabular-nums">
                        {activeCoursesCount}
                      </span>
                      <span className="text-xs text-stone-500 mr-1">دوره فعال</span>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-2">
                      از مجموع {courses.length} دوره آموزشی
                    </span>
                  </div>

                </div>

                {/* 2-Column Split: Recent Students & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Recent Students */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <h3 className="font-bold text-sm text-stone-900">آخرین هنرجویان ثبت‌نام شده</h3>
                      <button
                        onClick={() => setActiveAdminTab('students')}
                        className="text-xs text-amber-800 font-semibold hover:underline"
                      >
                        مشاهده همه
                      </button>
                    </div>

                    <div className="space-y-3">
                      {students.slice(0, 4).map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-stone-50/80 text-xs"
                        >
                          <div>
                            <span className="font-bold text-stone-900 block">{student.fullName}</span>
                            <span className="text-[11px] text-stone-500 block truncate max-w-[200px]">
                              {student.courseTitle}
                            </span>
                          </div>

                          <div className="text-left">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                student.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : student.paymentStatus === 'partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {student.paymentStatus === 'paid' ? 'تسویه کامل' : 'اقساط'}
                            </span>
                            <span className="text-[10px] text-stone-400 block mt-1 tabular-nums">
                              {student.phone}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <h3 className="font-bold text-sm text-stone-900">آخرین سفارشات کیک و دسر</h3>
                      <button
                        onClick={() => setActiveAdminTab('orders')}
                        className="text-xs text-amber-800 font-semibold hover:underline"
                      >
                        مشاهده همه
                      </button>
                    </div>

                    <div className="space-y-3">
                      {orders.slice(0, 4).map((order) => (
                        <div
                          key={order.id}
                          className="p-3 rounded-xl bg-stone-50/80 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-900">{order.orderNumber}</span>
                              <span className="font-bold text-stone-900">{order.customerName}</span>
                            </div>
                            <span className="text-[11px] text-stone-500 block mt-0.5">
                              تحویل: {order.deliveryDate}
                            </span>
                          </div>

                          <div className="text-left">
                            <span className="font-extrabold text-stone-900 block tabular-nums">
                              {order.totalAmount.toLocaleString('fa-IR')} تومان
                            </span>
                            <span className="text-[10px] font-semibold text-stone-500">
                              {order.items.length} قلم محصول
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Quick Shortcuts */}
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-amber-950">مدیریت سریع کارگاه‌ها</h4>
                    <p className="text-xs text-amber-800">
                      برای تغییر ظرفیت، افزودن سرفصل جدید یا ثبت سفارش جدید از دکمه‌های روبه‌رو استفاده فرمایید.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveAdminTab('students')}
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
                    >
                      ثبت هنرجوی جدید
                    </button>
                    <button
                      onClick={() => setActiveAdminTab('courses')}
                      className="px-4 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 rounded-xl border border-stone-300"
                    >
                      ویرایش دوره‌ها
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activeAdminTab === 'students' && <StudentsManager />}
            {activeAdminTab === 'courses' && <CoursesManager />}
            {activeAdminTab === 'products' && <ProductsManager />}
            {activeAdminTab === 'orders' && <OrdersManager />}
            {activeAdminTab === 'faqs' && <FaqManager />}
            {activeAdminTab === 'settings' && <SettingsManager />}

          </main>

        </div>
      </div>

    </div>
  );
};
