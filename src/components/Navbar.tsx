import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, LayoutDashboard, UtensilsCrossed, Sparkles, Search } from 'lucide-react';
import { InquiryModal } from './InquiryModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cart,
    setIsCartDrawerOpen,
    siteSettings,
  } = useApp();

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-20">
            
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-2.5 text-stone-900 group text-right"
              >
                {siteSettings.logoImageUrl ? (
                  <img
                    src={siteSettings.logoImageUrl}
                    alt={siteSettings.brandName}
                    className="w-10 h-10 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-800 flex items-center justify-center text-amber-50 shadow-sm transition-transform group-hover:scale-105">
                    <UtensilsCrossed className="w-5 h-5 text-amber-200" />
                  </div>
                )}
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-stone-900 block leading-tight">
                    {siteSettings.brandName}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    {siteSettings.brandSubtitle}
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links (single-line, clean text hover) */}
            {currentView === 'landing' ? (
              <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
                <a href="#courses" className="hover:text-amber-900 transition-colors whitespace-nowrap">
                  دوره‌های آموزشی
                </a>
                <a href="#products" className="hover:text-amber-900 transition-colors whitespace-nowrap">
                  سفارش کیک و دسر
                </a>
                <a href="#features" className="hover:text-amber-900 transition-colors whitespace-nowrap">
                  مزایای آکادمی
                </a>
                <a href="#faqs" className="hover:text-amber-900 transition-colors whitespace-nowrap">
                  سوالات متداول
                </a>
                <a href="#contact" className="hover:text-amber-900 transition-colors whitespace-nowrap">
                  تماس و آدرس
                </a>
              </nav>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
                <span>پنل مدیریت داخلی آموزشگاه و آتلیه فندق</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">پایگاه داده مرورگر فعال</span>
              </div>
            )}

            {/* Zone 3: Actions (Inquiry, Cart & Admin Switch) */}
            <div className="flex items-center gap-2.5 shrink-0">
              {currentView === 'landing' && (
                <>
                  {/* Self-service Inquiry Button */}
                  <button
                    onClick={() => setIsInquiryOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-amber-900 bg-stone-100 hover:bg-amber-100/70 border border-stone-200 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
                    title="پیگیری سفارش کیک و استعلام مدارک هنرجو"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-800" />
                    <span className="hidden sm:inline">پیگیری سفارش و سوابق هنرجو</span>
                    <span className="sm:hidden">پیگیری</span>
                  </button>

                  {/* Cart Button */}
                  <button
                    onClick={() => setIsCartDrawerOpen(true)}
                    className="relative p-2.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                    title="سبد سفارشات"
                    aria-label="سبد خرید"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {totalCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-800 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-sm">
                        {totalCartCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {currentView === 'landing' ? (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-200/80 hover:bg-stone-300/80 rounded-xl transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-800" />
                  <span className="hidden sm:inline">پنل ادمین فندق</span>
                  <span className="sm:hidden">پنل ادمین</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('landing')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors whitespace-nowrap shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>مشاهده سایت (نمای مشتری)</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Inquiry Modal */}
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
};
