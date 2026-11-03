import React from 'react';
import { Course } from '../types';
import { Calendar, User, Clock, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { setSelectedCourseForDetail } = useApp();

  const spotsLeft = course.capacity - course.enrolledCount;
  const isFull = spotsLeft <= 0 || course.status === 'full';
  const progressPercent = Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100));

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      
      {/* Course Image Slot with Fallback */}
      <div className="relative h-52 overflow-hidden bg-stone-100">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_culinary_pastry_1793696672801.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
        
        {/* Unboxed clean metadata badge */}
        <div className="absolute bottom-3 right-3 text-xs text-stone-200 font-medium flex items-center gap-1.5">
          <span>{course.category}</span>
          <span aria-hidden="true">·</span>
          <span>{course.formatLabel}</span>
        </div>
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Title */}
          <h3 className="font-bold text-lg text-stone-900 group-hover:text-amber-900 transition-colors leading-snug line-clamp-2">
            {course.title}
          </h3>

          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Quick Details List */}
          <div className="mt-4 space-y-1.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-500">
                <User className="w-3.5 h-3.5 text-amber-800" />
                <span>مدرس:</span>
              </span>
              <span className="font-semibold text-stone-800">{course.instructor}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-500">
                <Clock className="w-3.5 h-3.5 text-amber-800" />
                <span>مدت و زمان:</span>
              </span>
              <span className="font-medium text-stone-700">{course.duration}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-500">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                <span>شروع دوره:</span>
              </span>
              <span className="font-medium text-stone-700">{course.startDate}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-stone-500">ظرفیت کارگاه:</span>
              <span className={`font-semibold tabular-nums ${isFull ? 'text-rose-700' : 'text-amber-900'}`}>
                {isFull ? 'تکمیل ظرفیت شد' : `${spotsLeft} نفر ظرفیت باقی‌مانده`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? 'bg-rose-500' : 'bg-amber-700'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            {course.discountPrice ? (
              <>
                <span className="text-[11px] line-through text-stone-400 tabular-nums">
                  {course.price.toLocaleString('fa-IR')} تومان
                </span>
                <span className="text-base font-extrabold text-stone-900 tabular-nums">
                  {course.discountPrice.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
                </span>
              </>
            ) : (
              <span className="text-base font-extrabold text-stone-900 tabular-nums">
                {course.price.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setSelectedCourseForDetail(course)}
            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200/70"
          >
            <span>سرفصل‌ها و ثبت‌نام</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
