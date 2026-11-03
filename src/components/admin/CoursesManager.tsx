import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseFormat, CourseStatus } from '../../types';
import { Plus, Edit2, Trash2, X, Sparkles, CheckCircle2, Users, Calendar, DollarSign } from 'lucide-react';

const CATEGORIES = [
  'کیک‌سازی پیشرفته',
  'دسرهای مدرن و فرانسوی',
  'شیرینی‌های سنتی و خشک',
  'نانوایی و نان‌های حجیم',
  'آشپزی ملل و فینگرفود',
  'باریستا و کافه‌داری'
];

export const CoursesManager: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(10);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [format, setFormat] = useState<CourseFormat>('in_person');
  const [formatLabel, setFormatLabel] = useState('حضوری کارگاهی (۱۰۰٪ عملی)');
  const [duration, setDuration] = useState('۴ جلسه ۴ ساعته');
  const [sessionsCount, setSessionsCount] = useState<number>(4);
  const [certificate, setCertificate] = useState('مدرک بین‌المللی فنی‌وحرفه‌ای');
  const [instructor, setInstructor] = useState('استاد نسترن پناهی');
  const [instructorRole] = useState('مدرس ارشد قنادی');
  const [startDate, setStartDate] = useState('۱۵ آذر ۱۴۰۳');
  const [schedule, setSchedule] = useState('پنج‌شنبه‌ها ۹:۰۰ الی ۱۳:۰۰');
  const [image, setImage] = useState('/src/assets/images/hero_culinary_pastry_1793696672801.jpg');
  const [status, setStatus] = useState<CourseStatus>('registering');
  const [description, setDescription] = useState('');
  const [materialsProvided, setMaterialsProvided] = useState(true);

  // Dynamic syllabus items
  const [syllabusItems, setSyllabusItems] = useState<string[]>([
    'پخت اصولی کیک و اسفنج پایه',
    'فیلینگ‌گذاری و تراز کردن لایه‌ها',
    'گاناش‌کشی با زوایای تیز (Sharp Edges)'
  ]);
  const [newItemText, setNewItemText] = useState('');

  const openAddModal = () => {
    setEditingCourse(null);
    setTitle('');
    setCategory(CATEGORIES[0]);
    setPrice(10000000);
    setDiscountPrice(0);
    setCapacity(10);
    setEnrolledCount(0);
    setFormat('in_person');
    setFormatLabel('حضوری کارگاهی (۱۰۰٪ عملی)');
    setDuration('۵ جلسه ۴ ساعته');
    setSessionsCount(5);
    setCertificate('مدرک بین‌المللی فنی‌وحرفه‌ای با کد استاندارد ILO');
    setInstructor('استاد نسترن پناهی');
    setStartDate('۱۵ آذر ۱۴۰۳');
    setSchedule('پنج‌شنبه‌ها و جمعه‌ها ۱۰:۰۰ الی ۱۴:۰۰');
    setImage('/src/assets/images/hero_culinary_pastry_1793696672801.jpg');
    setStatus('registering');
    setDescription('');
    setMaterialsProvided(true);
    setSyllabusItems([
      'آموزش پخت انواع اسفنج‌های استاندارد قنادی',
      'فیلینگ‌گذاری مدرن و پایداری کیک‌های چندطبقه',
      'دکوراتوری و کار با شکلات و فوندانت'
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setCategory(c.category);
    setPrice(c.price);
    setDiscountPrice(c.discountPrice || 0);
    setCapacity(c.capacity);
    setEnrolledCount(c.enrolledCount);
    setFormat(c.format);
    setFormatLabel(c.formatLabel);
    setDuration(c.duration);
    setSessionsCount(c.sessionsCount);
    setCertificate(c.certificate);
    setInstructor(c.instructor);
    setStartDate(c.startDate);
    setSchedule(c.schedule);
    setImage(c.image);
    setStatus(c.status);
    setDescription(c.description);
    setMaterialsProvided(c.materialsProvided);
    setSyllabusItems([...c.syllabusItems]);
    setIsModalOpen(true);
  };

  const addSyllabusItem = () => {
    if (!newItemText.trim()) return;
    setSyllabusItems([...syllabusItems, newItemText.trim()]);
    setNewItemText('');
  };

  const removeSyllabusItem = (index: number) => {
    setSyllabusItems(syllabusItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || syllabusItems.length === 0) {
      showToast('لطفاً عنوان دوره و حداقل یک سرفصل تدریسی را وارد فرمایید.', 'error');
      return;
    }

    const courseData = {
      title: title.trim(),
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      category,
      price: Number(price),
      discountPrice: discountPrice > 0 ? Number(discountPrice) : undefined,
      capacity: Number(capacity),
      enrolledCount: Number(enrolledCount),
      format,
      formatLabel,
      duration,
      sessionsCount: Number(sessionsCount),
      certificate,
      instructor,
      instructorRole: 'مدرس قنادی آموزشگاه فندق',
      syllabusItems,
      prerequisites: 'بدون پیش‌نیاز (از پایه)',
      level: 'مقدماتی تا پیشرفته',
      startDate,
      schedule,
      image,
      status,
      description: description.trim() || 'دوره تخصصی شیرینی‌پزی و قنادی آموزشگاه فندق.',
      materialsProvided,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, courseData);
    } else {
      addCourse(courseData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">مدیریت دوره‌های آموزشی و کارگاه‌ها</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            تعریف سرفصل‌ها و آیتم‌های تدریسی، قیمت‌گذاری، تعیین ظرفیت و نحوه برگزاری
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دوره جدید</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => {
          const spotsLeft = course.capacity - course.enrolledCount;
          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                  <span className="font-semibold text-amber-900">{course.category}</span>
                  <span>·</span>
                  <span>{course.formatLabel}</span>
                </div>

                <h3 className="font-bold text-base text-stone-900 leading-snug line-clamp-2">
                  {course.title}
                </h3>

                {/* Capacity & Price */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">مدرس:</span>
                    <span className="font-semibold text-stone-800">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">ظرفیت هنرجو:</span>
                    <span className="font-bold tabular-nums text-stone-800">
                      {course.enrolledCount} از {course.capacity} نفر ({spotsLeft > 0 ? `${spotsLeft} خالی` : 'تکمیل'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">شهریه:</span>
                    <span className="font-black tabular-nums text-stone-900">
                      {(course.discountPrice || course.price).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                {/* Syllabus preview */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-stone-700 block mb-1">
                    سرفصل‌ها ({course.syllabusItems.length} آیتم):
                  </span>
                  <ul className="text-[11px] text-stone-600 space-y-0.5 line-clamp-3">
                    {course.syllabusItems.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="truncate">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    course.status === 'registering'
                      ? 'bg-emerald-50 text-emerald-800'
                      : course.status === 'full'
                      ? 'bg-rose-50 text-rose-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {course.status === 'registering'
                    ? 'در حال ثبت‌نام'
                    : course.status === 'full'
                    ? 'تکمیل ظرفیت'
                    : 'در حال برگزاری'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-amber-900 transition-colors"
                    title="ویرایش دوره"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`آیا از حذف دوره «${course.title}» اطمینان دارید؟`)) {
                        deleteCourse(course.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="حذف دوره"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingCourse ? 'ویرایش اطلاعات دوره' : 'تعریف دوره جدید در آموزشگاه فندق'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  عنوان کامل دوره آموزشی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: دوره تخصصی دکور فوندانت و کیک‌های ضدجاذبه"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    دسته‌بندی کلاس
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    نحوه برگزاری
                  </label>
                  <select
                    value={format}
                    onChange={(e) => {
                      const f = e.target.value as CourseFormat;
                      setFormat(f);
                      if (f === 'in_person') setFormatLabel('حضوری کارگاهی (۱۰۰٪ عملی)');
                      else if (f === 'semi_private') setFormatLabel('نیمه‌خصوصی (ظرفیت محدود)');
                      else if (f === 'online') setFormatLabel('آنلاین تعاملی با پشتیبانی');
                      else setFormatLabel('ورکشاپ فشرده ۱ روزه');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  >
                    <option value="in_person">حضوری عملی (کارگاهی)</option>
                    <option value="semi_private">نیمه‌خصوصی</option>
                    <option value="workshop">ورکشاپ فشرده</option>
                    <option value="online">آنلاین و مجازی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    شهریه مصوب (تومان)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    شهریه با تخفیف (اختیاری)
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    ظرفیت کل کارگاه
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    تعداد ثبت‌نام شده
                  </label>
                  <input
                    type="number"
                    value={enrolledCount}
                    onChange={(e) => setEnrolledCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    نام مدرس دوره
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    وضعیت دوره
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CourseStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  >
                    <option value="registering">در حال ثبت‌نام</option>
                    <option value="ongoing">در حال برگزاری</option>
                    <option value="full">تکمیل ظرفیت</option>
                    <option value="upcoming">به‌زودی</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Syllabus Items */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <label className="block font-bold text-stone-900 mb-2">
                  آیتم‌های تدریسی و سرفصل‌های دوره (چیا یاد می‌گیرند؟):
                </label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="عنوان آیتم یا تکنیک (مثلاً: تهیه گاناش پایدار برای شارپ ایج)"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSyllabusItem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSyllabusItem}
                    className="px-3.5 py-2 font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl whitespace-nowrap"
                  >
                    افزودن آیتم
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {syllabusItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSyllabusItem(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  توضیحات معرفی دوره
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
                >
                  ذخیره دوره
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
