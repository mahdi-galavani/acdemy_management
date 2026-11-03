import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ChevronDown, HelpCircle, PhoneCall, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { faqs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'courses' | 'orders' | 'certificates' | 'payments'>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="py-16 sm:py-24 border-b border-stone-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-900 tracking-wide mb-2">
            <span>مرکز پاسخ به پرسش‌های شما</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500 font-normal">آموزشگاه و استودیو قنادی فندق</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            سوالات متداول هنرجویان و مشتریان
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            پاسخ سریع و دقیق به رایج‌ترین پرسش‌ها پیرامون سرفصل دوره‌ها، اعتبار مدرک فنی‌وحرفه‌ای، زمان‌بندی سفارش کیک‌های مجلسی و شرایط پرداخت.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="پرسش خود را جستجو کنید (مثلاً: مدرک بین‌المللی، مواد اولیه، چند روز قبل سفارش، اقساط)..."
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs sm:text-sm text-stone-900 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Category Tabs (Interactive Filter Controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            همه سوالات ({faqs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('courses')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'courses'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            دوره‌ها و کارگاه‌ها
          </button>
          <button
            onClick={() => setSelectedCategory('certificates')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'certificates'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            مدارک و گواهینامه‌ها
          </button>
          <button
            onClick={() => setSelectedCategory('orders')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'orders'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            سفارش کیک و دسر
          </button>
          <button
            onClick={() => setSelectedCategory('payments')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'payments'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            پرداخت شهریه و اقساط
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
              <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">سوالی با این مشخصات یافت نشد.</p>
              <p className="text-xs text-stone-400 mt-1">
                می‌توانید مستقیماً با کارشناسان آموزش تماس بگیرید.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'border-amber-800/30 bg-amber-50/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-stone-900">
                      {faq.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-amber-800 text-white rotate-180' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-amber-100/80 pt-3 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Direct Contact Support Card */}
        <div className="mt-10 p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-amber-200" />
            </div>
            <div className="text-right">
              <h4 className="font-bold text-sm text-stone-900">نیاز به راهنمایی بیشتری دارید؟</h4>
              <p className="text-xs text-stone-500 mt-0.5">مشاوران ثبت نام و سفارشات آماده پاسخگویی هستند.</p>
            </div>
          </div>

          <a
            href="tel:02188880000"
            className="px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors whitespace-nowrap"
          >
            تماس با مشاور: ۰۲۱-۸۸۸۸۰۰۰۰
          </a>
        </div>

      </div>
    </section>
  );
};
