import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Upload, RotateCcw, Database, ShieldCheck, Server } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { exportDataJson, importDataJson, resetAllData, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJson(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-right">
      
      <div>
        <h2 className="text-xl font-bold text-stone-900">تنظیمات و پایگاه داده محلی مرورگر (Local Storage)</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          مدیریت ذخیره‌سازی داده‌ها، خروجی پشتیبان، بازیابی فایل و راهنمای اتصال به بک‌ند
        </p>
      </div>

      {/* Persistence Info Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3.5 text-xs">
        <Database className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1 text-amber-950">
          <span className="font-bold block text-sm">وضعیت ذخیره‌سازی فعلی: محلی در مرورگر (Local Storage)</span>
          <p className="leading-relaxed text-amber-900">
            همانطور که خواسته بودید، در این فاز کلیه تغییرات هنرجوها، دوره‌ها، منوی کیک‌ها، سفارشات و سوالات متداول به صورت کاملاً آنی و امن در حافظه LocalStorage مرورگر شما ذخیره می‌شوند و با رفرش صفحه پاک نخواهند شد.
          </p>
        </div>
      </div>

      {/* Backup & Restore Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Export Card */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">دانلود فایل پشتیبان (Export JSON)</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              از کلیه اطلاعات هنرجویان، دوره‌ها، محصولات و سفارشات یک خروجی کامل با فرمت استاندارد JSON دریافت کنید تا در هر دستگاه دیگری قابل بازخوانی باشد.
            </p>
          </div>

          <button
            onClick={exportDataJson}
            className="w-full py-2.5 px-4 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-300 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل Backup JSON</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">بازیابی اطلاعات از فایل (Import JSON)</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              فایل JSON قبلی خود را بارگذاری کنید تا تمامی دوره‌ها، هنرجوها و محصولات قبلی فوراً در این مرورگر بارگذاری شوند.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-300 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>انتخاب و بارگذاری فایل JSON</span>
            </button>
          </div>
        </div>

      </div>

      {/* Backend Roadmap Card */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-stone-900 font-bold text-sm">
          <Server className="w-5 h-5 text-amber-800" />
          <span>آمادگی معماری سیستم برای اتصال به بک‌ند (Backend Ready)</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          کلیه متدهای کار با داده‌ها در لایه کانتکست (<code className="font-mono text-amber-900">AppContext.tsx</code>) به صورت کامپوننت‌محور و ایزوله پیاده‌سازی شده‌اند. به محض تایید ظاهر و فرایندهای اجرایی، به سادگی می‌توان با اضافه کردن یک سرویس API (مانند Node.js Express یا FastAPI) متدها را به سرور متصل کرد بدون اینکه کوچک‌ترین تغییری در ظاهر فرم‌ها یا جداول نیاز باشد.
        </p>
      </div>

      {/* Danger Zone: Reset */}
      <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-rose-900">بازنشانی کامل داده‌ها به تنظیمات پیش‌فرض</h4>
            <p className="text-xs text-rose-700">
              این عمل کلیه دوره‌ها، هنرجویان و سفارشات را به داده‌های نمونه اولیه آموزشگاه فندق برمی‌گرداند.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('آیا از بازنشانی کلیه داده‌ها به مقادیر اولیه نمونه اطمینان دارید؟ کلیه تغییرات دستی حذف خواهد شد.')) {
                resetAllData();
              }
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی به حالت دمو</span>
          </button>
        </div>
      </div>

    </div>
  );
};
