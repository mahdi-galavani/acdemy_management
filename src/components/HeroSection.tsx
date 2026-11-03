import React from 'react';
import { Award, BookOpen, Clock, Users, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroSection: React.FC = () => {
  const { siteSettings } = useApp();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Hero: Content (Right in RTL) & Media (Left in RTL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Trust Kicker - Zero-pill clean text */}
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 tracking-wide mb-4">
              <span>{siteSettings.heroBadge}</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500 font-normal">{siteSettings.licenseNumber}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-[1.3] tracking-tight max-w-2xl text-balance">
              {siteSettings.heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              {siteSettings.heroDescription}
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                <span>مشاهده دوره‌های فعال</span>
                <ChevronLeft className="w-4 h-4" />
              </a>

              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/90 rounded-xl transition-colors border border-stone-300"
              >
                <span>سفارش آنلاین کیک و دسر</span>
              </a>
            </div>

            {/* Micro guarantees */}
            <div className="mt-7 flex flex-wrap items-center gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                <span>ورکشاپ‌های محدود به ۸ تا ۱۰ نفر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                <span>ارائه ایستگاه و کیت ابزار اختصاصی</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                <span>پشتیبانی مستمر و مشاوره ورود به بازار کار</span>
              </div>
            </div>

          </div>

          {/* Media visual column */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200/90 bg-stone-100">
              <img
                src={siteSettings.heroImageUrl}
                alt={siteSettings.brandName}
                className="w-full h-[420px] sm:h-[480px] object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/hero_culinary_pastry_1793696672801.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs font-semibold text-amber-300 mb-1">
                  کارگاه اختصاصی {siteSettings.brandName}
                </div>
                <div className="text-sm font-medium leading-snug">
                  محیط واقعی شیرینی‌پزی صنعتی با متریال اورجینال و مربیان دارای رتبه کشوری
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Proof & KPI Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-stone-200">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Users className="w-5 h-5 text-amber-800" />
              <span className="text-2xl font-black tabular-nums text-stone-900">{siteSettings.statGraduatesCount}</span>
            </div>
            <span className="text-xs font-bold text-stone-800">{siteSettings.statGraduatesTitle}</span>
            <span className="text-[11px] text-stone-500 mt-0.5">{siteSettings.statGraduatesDesc}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Award className="w-5 h-5 text-amber-800" />
              <span className="text-2xl font-black text-stone-900">{siteSettings.statCertificateTitle}</span>
            </div>
            <span className="text-xs font-bold text-stone-800">{siteSettings.statCertificateSub}</span>
            <span className="text-[11px] text-stone-500 mt-0.5">{siteSettings.statCertificateDesc}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <span className="text-2xl font-black tabular-nums text-stone-900">{siteSettings.statPracticalTitle}</span>
            </div>
            <span className="text-xs font-bold text-stone-800">{siteSettings.statPracticalSub}</span>
            <span className="text-[11px] text-stone-500 mt-0.5">{siteSettings.statPracticalDesc}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Clock className="w-5 h-5 text-amber-800" />
              <span className="text-2xl font-black text-stone-900">{siteSettings.statSupportTitle}</span>
            </div>
            <span className="text-xs font-bold text-stone-800">{siteSettings.statSupportSub}</span>
            <span className="text-[11px] text-stone-500 mt-0.5">{siteSettings.statSupportDesc}</span>
          </div>

        </div>

      </div>
    </section>
  );
};
