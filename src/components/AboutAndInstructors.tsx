import React from 'react';
import { ChefHat, Sparkles, Building2, Utensils, Star, Quote } from 'lucide-react';

export const AboutAndInstructors: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 border-b border-stone-200 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-900 tracking-wide mb-2">
            <span>چرا آموزشگاه و آتلیه فندق؟</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500 font-normal">استانداردهای آموزشی روز اروپا</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            تفاوت آموزش حرفه‌ای در فضای واقعی کارگاه
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
            ما در فندق معتقدیم شیرینی‌پزی و قنادی مهارتی تجربی است؛ از این رو رویکرد آموزشی ما بر پایه کار عملی تک‌تک هنرجویان با مدرن‌ترین تجهیزات است.
          </p>
        </div>

        {/* 3 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                ایستگاه کاری و کیت اختصاصی
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                در کلاس‌های حضوری فندق تماشاگر نیستید! هر هنرجو یک استند مجزا، میکسر، ابزارهای تخصصی و سهمیه کامل مواد اولیه درجه یک را در اختیار دارد و محصول نهایی را مستقلاً تولید می‌کند.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-amber-900">
              ظرفیت کلاس‌ها حداکثر ۸ الی ۱۰ نفر
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                مشاوره راه‌اندازی کسب‌وکار قنادی
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                فرمول‌های رسپی، محاسبه هزینه تمام‌شده هر کیلو کیک، نحوه قیمت‌گذاری سودده، بازاریابی اینستاگرامی و نحوه بسته‌بندی تجاری در کنار مهارت فنی به شما آموزش داده می‌شود.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-amber-900">
              بیش از ۳۵۰ کارگاه قنادی خانگی فعال
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                مدرک بین‌المللی با کد استعلام
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                پس از گذراندن دوره و آزمون عملی، گواهینامه معتبر فنی و حرفه‌ای با کد بین‌المللی ISCO اعطا می‌شود که قابل ترجمه رسمی دادگستری برای مهاجرت کاری به کشورهای اروپایی و کاناداست.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-amber-900">
              معتبر در ۱۶۰ کشور عضو سازمان جهانی کار
            </div>
          </div>

        </div>

        {/* Real Student Stories & Success Testimonials */}
        <div className="bg-amber-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <Quote className="w-10 h-10 text-amber-400 mb-4 opacity-75" />
            <p className="text-base sm:text-lg font-medium leading-relaxed mb-6">
              «قبل از دوره فندق حتی نمی‌توانستم خامه قنادی را فرم بدهم. بعد از اتمام دوره مسترکلاس کیک و پشتیبانی دلسوزانه مربیان، کارگاه خانگی کیک خودم را در کرج راه‌اندازی کردم و در ماه گذشته بیش از ۴۰ سفارش کیک تولد و عروسی تحویل دادم.»
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-800 flex items-center justify-center font-bold text-amber-200 text-sm">
                م‌ک
              </div>
              <div>
                <span className="font-bold text-sm block">مهسا کاظمی</span>
                <span className="text-xs text-amber-300 block">فارغ‌التحصیل دوره جامع کیک و موسس برند کیک ماهورا</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
