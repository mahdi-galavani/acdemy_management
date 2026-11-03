import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, LayoutDashboard, UtensilsCrossed, Sparkles, Search, ClipboardCheck, Command } from 'lucide-react';
import { InquiryModal } from './InquiryModal';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cart,
    setIsCartDrawerOpen,
    siteSettings,
  } = useApp();

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open search anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8 h-20">
            
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-2.5 text-stone-900 group text-right cursor-pointer"
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
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 block leading-tight">
                    {siteSettings.brandName}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    {siteSettings.brandSubtitle}
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links & Search Trigger */}
            {currentView === 'landing' ? (
              <div className="flex items-center gap-6">
                <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-stone-600">
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

                {/* Global Search Trigger (Desktop / Tablet) */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium text-stone-500 bg-stone-100/90 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200 rounded-xl transition-all w-48 lg:w-64 text-right shadow-2xs group cursor-pointer"
                  title="جستجوی سریع در دوره‌ها و کیک‌ها (Ctrl + K)"
                  aria-label="جستجوی سریع در سایت"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Search className="w-4 h-4 text-amber-800 transition-transform group-hover:scale-110 shrink-0" />
                    <span className="truncate">جستجوی دوره، کیک، دسر...</span>
                  </div>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-stone-400 bg-white border border-stone-200 rounded shadow-2xs">
                    ⌘K
                  </kbd>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
                <span>پنل مدیریت داخلی آموزشگاه و آتلیه فندق</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">پایگاه داده مرورگر فعال</span>
              </div>
            )}

            {/* Zone 3: Actions (Search Mobile, Inquiry, Cart & Admin Switch) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {currentView === 'landing' && (
                <>
                  {/* Search Icon Trigger for Mobile Screens */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="md:hidden p-2 text-stone-700 hover:text-amber-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                    title="جستجوی سریع"
                    aria-label="جستجوی سریع"
                  >
                    <Search className="w-5 h-5 text-amber-800" />
                  </button>

                  {/* Self-service Inquiry Button */}
                  <button
                    onClick={() => setIsInquiryOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-stone-700 hover:text-amber-900 bg-stone-100 hover:bg-amber-100/70 border border-stone-200 rounded-xl transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                    title="پیگیری سفارش کیک و استعلام مدارک هنرجو"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-amber-800" />
                    <span className="hidden sm:inline">پیگیری سفارش و سوابق</span>
                    <span className="sm:hidden text-[11px]">پیگیری</span>
                  </button>

                  {/* Cart Button */}
                  <button
                    onClick={() => setIsCartDrawerOpen(true)}
                    className="relative p-2.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-200/80 hover:bg-stone-300/80 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-800" />
                  <span className="hidden sm:inline">پنل ادمین فندق</span>
                  <span className="sm:hidden text-[11px]">ادمین</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('landing')}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-[11px] sm:text-xs">مشاهده سایت</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Global Search Palette Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Inquiry Modal */}
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
};
