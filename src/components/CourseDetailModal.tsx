import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Calendar, Clock, Award, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const CourseDetailModal: React.FC = () => {
  const { selectedCourseForDetail, setSelectedCourseForDetail, addStudent, showToast } = useApp();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!selectedCourseForDetail) return null;

  const course = selectedCourseForDetail;
  const spotsLeft = course.capacity - course.enrolledCount;
  const isFull = spotsLeft <= 0 || course.status === 'full';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('لطفاً نام و نام خانوادگی و شماره تماس را وارد فرمایید.', 'error');
      return;
    }

    addStudent({
      fullName: fullName.trim(),
      phone: phone.trim(),
      nationalCode: nationalCode.trim() || 'ثبت نشده',
      courseId: course.id,
      courseTitle: course.title,
      paymentStatus: 'pending',
      tuitionTotal: course.discountPrice || course.price,
      tuitionPaid: 0,
      certificateIssued: false,
      status: 'reserved',
      notes: notes.trim() || 'پیش‌ثبت‌نام آنلاین از طریق سایت',
    });

    setIsSubmitted(true);
  };

  const handleClose = () => {
    setSelectedCourseForDetail(null);
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative text-right">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 left-5 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
          aria-label="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Media & Banner */}
        <div className="relative h-56 sm:h-64 bg-stone-900 shrink-0">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          
          <div className="absolute bottom-6 right-6 left-6 text-white">
            <div className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-2">
              <span>{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.formatLabel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
            <div>
              <span className="text-stone-500 block mb-1">مدرس دوره:</span>
              <span className="font-bold text-stone-800 block">{course.instructor}</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{course.instructorRole}</span>
            </div>

            <div>
              <span className="text-stone-500 block mb-1">طول دوره:</span>
              <span className="font-bold text-stone-800 block">{course.duration}</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{course.sessionsCount} جلسه تخصصی</span>
            </div>

            <div>
              <span className="text-stone-500 block mb-1">زمان‌بندی:</span>
              <span className="font-bold text-stone-800 block">{course.schedule}</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">شروع: {course.startDate}</span>
            </div>

            <div>
              <span className="text-stone-500 block mb-1">شهریه مصوب:</span>
              <span className="font-extrabold text-stone-900 text-sm block tabular-nums">
                {(course.discountPrice || course.price).toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
              </span>
              {course.discountPrice && (
                <span className="text-[10px] line-through text-stone-400 block tabular-nums">
                  {course.price.toLocaleString('fa-IR')} تومان
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-2">درباره این دوره آموزشی:</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Syllabus Items (آیتم‌های دوره چیا هستن) */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-800" />
              <span>سرفصل‌ها و آیتم‌های تدریسی در این دوره:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.syllabusItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantees & Certificate */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Award className="w-4 h-4 text-amber-800" />
              <span>گواهینامه و امکانات کارگاهی:</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {course.certificate}
            </p>
            <p className="text-amber-700 text-[11px]">
              {course.materialsProvided
                ? '✓ کلیه مواد اولیه درجه یک (شکلات بلژیکی، خامه، آرد، رنگ‌ها و مغزها) و ابزار کار در طول کلاس توسط آموزشگاه به صورت رایگان تامین می‌گردد.'
                : '✓ راهنمای تهیه ابزار و تهیه مواد اولیه در جلسه توجیهی ارائه می‌گردد.'}
            </p>
          </div>

          {/* Quick Registration Form */}
          <div className="pt-4 border-t border-stone-200">
            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-900 text-base">پیش‌ثبت‌نام شما با موفقیت ثبت شد!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  اطلاعات شما در سیستم هنرجویان آموزشگاه فندق ذخیره گردید. کارشناسان آموزش جهت نهایی‌سازی ثبت‌نام و ارسال پیش‌فاکتور ظرف ۲۴ ساعت آینده با شما تماس خواهند گرفت.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-3 px-5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-300 rounded-xl transition-colors"
                >
                  بستن پنجره
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">فرم پیش‌ثبت‌نام آنلاین در دوره:</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {isFull
                        ? 'ظرفیت تکمیل است؛ با ثبت فرم در لیست انتظار قرار می‌گیرید.'
                        : `هم‌اکنون ${spotsLeft} جای خالی در این دوره باقی مانده است.`}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        نام و نام خانوادگی <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثلاً: سحر محمدی"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        شماره همراه (واتساپ / تماس) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="۰۹۱۲..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        کد ملی (اختیاری جهت صدور مدرک)
                      </label>
                      <input
                        type="text"
                        value={nationalCode}
                        onChange={(e) => setNationalCode(e.target.value)}
                        placeholder="۰۰۱۲۳۴۵۶۷۸"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        توضیحات یا زمان مناسب تماس
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="مثلاً: پرداخت به صورت اقساطی مد نظرم هست"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-sm"
                    >
                      ثبت نهایی و رزرو صندلی
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
