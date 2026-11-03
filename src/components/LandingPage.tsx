import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HeroSection } from './HeroSection';
import { CourseCard } from './CourseCard';
import { ProductCard } from './ProductCard';
import { AboutAndInstructors } from './AboutAndInstructors';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';
import { ProductCategoryType } from '../types';
import { Search, GraduationCap, Cake, Sparkles, Filter, ChevronLeft, ShoppingBag } from 'lucide-react';

const PRODUCT_CATEGORIES: { id: ProductCategoryType; label: string }[] = [
  { id: 'cakes', label: 'کیک‌های سفارشی و مراسمات' },
  { id: 'desserts', label: 'دسرهای فرانسوی و مدرن' },
  { id: 'dry_pastries', label: 'شیرینی خشک و سنتی اعلا' },
  { id: 'finger_foods', label: 'فینگرفود و شورینی' },
];

const CAKE_SUBCATEGORIES = [
  'همه',
  'تولد',
  'عروسی و نامزدی',
  'دورهمی و عصرانه',
  'دخترانه',
  'پسرانه',
];

export const LandingPage: React.FC = () => {
  const { courses, products, cart, setIsCartDrawerOpen } = useApp();

  // Courses filters
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('all');
  const [courseFormatFilter, setCourseFormatFilter] = useState('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Products filters
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategoryType>('cakes');
  const [selectedCakeSubcategory, setSelectedCakeSubcategory] = useState('همه');
  const [productSearch, setProductSearch] = useState('');

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = courseCategoryFilter === 'all' || c.category === courseCategoryFilter;
      const matchFormat = courseFormatFilter === 'all' || c.format === courseFormatFilter;
      const matchSearch =
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.syllabusItems.some((item) => item.toLowerCase().includes(courseSearch.toLowerCase())) ||
        c.instructor.toLowerCase().includes(courseSearch.toLowerCase());
      return matchCat && matchFormat && matchSearch;
    });
  }, [courses, courseCategoryFilter, courseFormatFilter, courseSearch]);

  // Unique course categories from actual data
  const courseCategories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category));
    return ['all', ...Array.from(set)];
  }, [courses]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = p.category === selectedProductCategory;
      const matchSub =
        selectedProductCategory !== 'cakes' ||
        selectedCakeSubcategory === 'همه' ||
        p.subcategory === selectedCakeSubcategory;
      const matchSearch =
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSub && matchSearch;
    });
  }, [products, selectedProductCategory, selectedCakeSubcategory, productSearch]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-stone-50 min-h-screen text-right">
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Courses Section */}
      <section id="courses" className="py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 tracking-wide mb-2">
                <span>تقویم آموزشی پاییز و زمستان ۱۴۰۳</span>
                <span aria-hidden="true">·</span>
                <span className="text-stone-500 font-normal">کارگاه‌های تخصصی با مدرک فنی‌وحرفه‌ای</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                دوره‌های تخصصی شیرینی‌پزی و قنادی فندق
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                هر دوره شامل آموزش جزء به جزء تکنیک‌ها، مواد اولیه رایگان، کار عملی اختصاصی و گواهینامه معتبر بین‌المللی است.
              </p>
            </div>

            {/* Live Search for courses */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="جستجوی دوره، سرفصل، مدرس..."
                className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 bg-white"
              />
            </div>
          </div>

          {/* Course Category Filter Buttons (Interactive Filter Controls) */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl mb-4 overflow-x-auto no-scrollbar">
            {courseCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCourseCategoryFilter(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  courseCategoryFilter === cat
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat === 'all' ? 'همه دوره‌ها' : cat}
              </button>
            ))}
          </div>

          {/* Format Sub-filter (حضوری، آنلاین، نیمه‌خصوصی) */}
          <div className="flex items-center gap-3 text-xs text-stone-600 mb-8 pb-3 border-b border-stone-200">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              نحوه برگزاری:
            </span>
            <button
              onClick={() => setCourseFormatFilter('all')}
              className={`hover:text-amber-900 transition-colors ${
                courseFormatFilter === 'all' ? 'font-bold text-amber-900 underline' : ''
              }`}
            >
              همه حالت‌ها
            </button>
            <span>·</span>
            <button
              onClick={() => setCourseFormatFilter('in_person')}
              className={`hover:text-amber-900 transition-colors ${
                courseFormatFilter === 'in_person' ? 'font-bold text-amber-900 underline' : ''
              }`}
            >
              حضوری کارگاهی
            </button>
            <span>·</span>
            <button
              onClick={() => setCourseFormatFilter('semi_private')}
              className={`hover:text-amber-900 transition-colors ${
                courseFormatFilter === 'semi_private' ? 'font-bold text-amber-900 underline' : ''
              }`}
            >
              نیمه‌خصوصی
            </button>
            <span>·</span>
            <button
              onClick={() => setCourseFormatFilter('online')}
              className={`hover:text-amber-900 transition-colors ${
                courseFormatFilter === 'online' ? 'font-bold text-amber-900 underline' : ''
              }`}
            >
              آنلاین تعاملی
            </button>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <GraduationCap className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="font-bold text-sm">دوره‌ای با این فیلتر یافت نشد.</p>
                <p className="text-xs text-stone-400 mt-1">لطفاً فیلترهای جستجو را بازنشانی کنید.</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>

        </div>
      </section>

      {/* 3. Products & Cake Ordering Section */}
      <section id="products" className="py-16 sm:py-24 border-b border-stone-200 bg-stone-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 tracking-wide mb-2">
                <span>آتلیه قنادی و شیرینی‌پزی فندق</span>
                <span aria-hidden="true">·</span>
                <span className="text-stone-500 font-normal">پخت روزانه با مواد اورجینال اروپایی</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                سفارش آنلاین کیک‌های اختصاصی و دسرهای لوکس
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                کیک‌های عروسی و نامزدی، تولدهای پسرانه و دخترانه، دسرهای تک‌نفره فرانسوی و شیرینی‌های اعلای ایرانی با امکان انتخاب فیلینگ و متن دلخواه.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="جستجوی کیک، دسر، شیرینی..."
                className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 bg-white"
              />
            </div>
          </div>

          {/* Primary Product Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl mb-4 overflow-x-auto no-scrollbar">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedProductCategory(cat.id);
                  setSelectedCakeSubcategory('همه');
                }}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedProductCategory === cat.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Subcategories (specifically dynamic for cakes as requested: تولد، عروسی، دورهمی، پسرانه، دخترانه) */}
          {selectedProductCategory === 'cakes' && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-stone-500 font-semibold whitespace-nowrap">مناسبت کیک:</span>
              {CAKE_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedCakeSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCakeSubcategory === sub
                      ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <Cake className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="font-bold text-sm">محصولی با این مشخصات یافت نشد.</p>
                <p className="text-xs text-stone-400 mt-1">لطفاً دسته‌بندی دیگری را انتخاب کنید.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Custom Cake Order Hotline Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-right">
              <span className="text-xs font-bold text-amber-900">سفارش پروژه‌های خاص و کیک‌های رویایی</span>
              <h3 className="text-lg font-bold text-stone-900">طرح خاصی در اینستاگرام یا پینترست دیده‌اید؟</h3>
              <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
                تیم دکوراتوری آموزشگاه فندق با تجربه اجرای بیش از ۱,۲۰۰ کیک مجلل عروسی و تولد، توانایی مدل‌سازی و پیاده‌سازی هر طرح و استراکچر خاصی را داراست.
              </p>
            </div>

            <a
              href="https://wa.me/989123456789"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-sm hover:shadow whitespace-nowrap shrink-0"
            >
              مشاوره و ارسال عکس کیک در واتساپ
            </a>
          </div>

        </div>
      </section>

      {/* 4. Academy Features & Master Instructors */}
      <AboutAndInstructors />

      {/* 5. Smart FAQ Section */}
      <FaqSection />

      {/* 6. Footer */}
      <Footer />

      {/* Floating Cart Button for Mobile View */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-5 right-5 z-40 md:hidden">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-amber-800 text-white rounded-2xl shadow-xl font-bold text-xs"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>سبد سفارش ({totalCartCount})</span>
          </button>
        </div>
      )}

    </div>
  );
};
