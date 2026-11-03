import React from 'react';
import { UtensilsCrossed, MapPin, Phone, Mail, Instagram, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer id="contact" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">آموزشگاه فندق</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              مرکز تخصصی آموزش هنر شیرینی‌پزی، دکور کیک‌های مدرن، دسرهای فرانسوی و نان‌های حجیم زیر نظر سازمان آموزش فنی‌وحرفه‌ای کشور.
            </p>
            <div className="text-xs text-amber-400 font-medium pt-1">
              دارای مجوز رسمی شماره ۹۸/۲۴۰۱
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#courses" className="hover:text-amber-400 transition-colors">لیست دوره‌های آموزشی</a>
              </li>
              <li>
                <a href="#products" className="hover:text-amber-400 transition-colors">سفارش کیک‌های مجلسی</a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-amber-400 transition-colors">مرکز سوالات متداول</a>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="hover:text-amber-400 transition-colors text-right"
                >
                  ورود به پنل مدیریت (ادمین)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">اطلاعات تماس</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>تهران، خیابان ولیعصر، بالاتر از میدان ونک، کوچه شهید فلاحی، پلاک ۱۸، ساختمان آکادمی فندق</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="tabular-nums">۰۲۱-۸۸۸۸۰۰۰۰ | ۰۹۱۲۳۴۵۶۷۸۹</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>شنبه تا پنج‌شنبه: ۹:۰۰ الی ۱۹:۰۰</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Order Notes */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">آتلیه سفارشات اختصاصی</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              جهت سفارش کیک‌های خاص نامزدی، عروسی و رویدادهای شرکتی با طراحی اختصاصی، همه‌روزه می‌توانید جهت مشاوره حضوری و تست طعم فیلینگ به آتلیه فندق مراجعه فرمایید.
            </p>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 text-[11px] text-stone-300">
              ارسال امن با خودروهای مجهز به یخچال در سراسر تهران و حومه.
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© تمامی حقوق برای آموزشگاه و آتلیه قنادی فندق محفوظ است.</p>
          <p className="text-[11px]">طراحی شده برای آموزش تخصصی و سفارش آنلاین شیرینی و کیک</p>
        </div>

      </div>
    </footer>
  );
};
