import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Course, Product } from '../types';
import {
  Search,
  X,
  GraduationCap,
  Cake,
  FolderTree,
  ArrowRight,
  Clock,
  Sparkles,
  CornerDownLeft,
  ChevronLeft,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchTab = 'all' | 'courses' | 'products' | 'categories';

interface SearchResultItem {
  id: string;
  type: 'course' | 'product' | 'category';
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  badge: string;
  price?: number;
  priceSuffix?: string;
  matchedReason?: string;
  courseData?: Course;
  productData?: Product;
  categoryTarget?: 'courses' | 'products';
}

// Normalize Persian and Arabic characters for accurate search matching
const normalizePersian = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .trim();
};

const POPULAR_SEARCH_TAGS = [
  'کیک هویج و گردو',
  'ورکشاپ خمیرترش',
  'دسر فرانسوی',
  'کیک تولد مدرن',
  'شیرینی سنتی عید',
  'تکنیک فوندانت',
  'چیزکیک سن سباستین',
  'گاناش بلژیکی'
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    courses,
    products,
    setSelectedCourseForDetail,
    setSelectedProductForOrder,
    setCurrentView,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<SearchTab>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setActiveIndex(0);
    } else {
      setQuery('');
      setSelectedTab('all');
    }
  }, [isOpen]);

  // Global Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Collect unique categories across courses and products
  const categoryList = useMemo(() => {
    const list: Array<{ name: string; count: number; target: 'courses' | 'products'; desc: string }> = [];
    const courseCatMap = new Map<string, number>();
    const productCatMap = new Map<string, number>();

    courses.forEach(c => {
      if (c.category) {
        courseCatMap.set(c.category, (courseCatMap.get(c.category) || 0) + 1);
      }
    });

    products.forEach(p => {
      if (p.subcategory) {
        productCatMap.set(p.subcategory, (productCatMap.get(p.subcategory) || 0) + 1);
      }
      if (p.category === 'cakes') {
        productCatMap.set('کیک‌های تشریفاتی و ژورنالی', (productCatMap.get('کیک‌های تشریفاتی و ژورنالی') || 0) + 1);
      } else if (p.category === 'desserts') {
        productCatMap.set('دسرهای بوتیکی و تک‌نفره', (productCatMap.get('دسرهای بوتیکی و تک‌نفره') || 0) + 1);
      }
    });

    courseCatMap.forEach((count, name) => {
      list.push({
        name,
        count,
        target: 'courses',
        desc: `دسته دوره‌های آموزشی آکادمی (${count} دوره)`,
      });
    });

    productCatMap.forEach((count, name) => {
      list.push({
        name,
        count,
        target: 'products',
        desc: `دسته کیک و شیرینی‌های آتلیه فندق (${count} مورد)`,
      });
    });

    return list;
  }, [courses, products]);

  // Compute Search Results
  const results = useMemo<SearchResultItem[]>(() => {
    const rawQuery = query.trim();
    const cleanQuery = normalizePersian(rawQuery);

    if (!cleanQuery) return [];

    const items: SearchResultItem[] = [];

    // 1. Search Courses
    if (selectedTab === 'all' || selectedTab === 'courses') {
      courses.forEach(course => {
        const titleNorm = normalizePersian(course.title);
        const descNorm = normalizePersian(course.description);
        const catNorm = normalizePersian(course.category);
        const instructorNorm = normalizePersian(course.instructor);
        const syllabusMatch = course.syllabusItems?.find(item =>
          normalizePersian(item).includes(cleanQuery)
        );

        const isTitleMatch = titleNorm.includes(cleanQuery);
        const isDescMatch = descNorm.includes(cleanQuery);
        const isCatMatch = catNorm.includes(cleanQuery);
        const isInstMatch = instructorNorm.includes(cleanQuery);

        if (isTitleMatch || isDescMatch || isCatMatch || isInstMatch || !!syllabusMatch) {
          let reason: string | undefined;
          if (syllabusMatch) {
            reason = `سرفصل: «${syllabusMatch}»`;
          } else if (isInstMatch) {
            reason = `مدرس: ${course.instructor}`;
          } else if (isCatMatch) {
            reason = `دسته‌بندی: ${course.category}`;
          }

          items.push({
            id: `course-${course.id}`,
            type: 'course',
            title: course.title,
            subtitle: `${course.category} · مدرس: ${course.instructor} · مدت: ${course.duration}`,
            description: course.description,
            image: course.image,
            badge: course.formatLabel || 'دوره آموزشی',
            price: course.discountPrice || course.price,
            priceSuffix: 'تومان',
            matchedReason: reason,
            courseData: course,
          });
        }
      });
    }

    // 2. Search Products
    if (selectedTab === 'all' || selectedTab === 'products') {
      products.forEach(product => {
        const titleNorm = normalizePersian(product.title);
        const descNorm = normalizePersian(product.description);
        const catNorm = normalizePersian(product.subcategory);
        const ingredientMatch = product.ingredients?.find(item =>
          normalizePersian(item).includes(cleanQuery)
        );

        const isTitleMatch = titleNorm.includes(cleanQuery);
        const isDescMatch = descNorm.includes(cleanQuery);
        const isCatMatch = catNorm.includes(cleanQuery);

        if (isTitleMatch || isDescMatch || isCatMatch || !!ingredientMatch) {
          let reason: string | undefined;
          if (ingredientMatch) {
            reason = `حاوی مواد اولیه: «${ingredientMatch}»`;
          } else if (isCatMatch) {
            reason = `دسته‌بندی: ${product.subcategory}`;
          }

          items.push({
            id: `product-${product.id}`,
            type: 'product',
            title: product.title,
            subtitle: `${product.subcategory} · تحویل ${product.leadTimeDays} روزه ${product.isPerKg ? '(قیمت بر اساس وزن)' : ''}`,
            description: product.description,
            image: product.image,
            badge: product.category === 'cakes' ? 'کیک ژورنالی' : 'دسر و شیرینی',
            price: product.price,
            priceSuffix: product.isPerKg ? 'تومان / هر کیلو' : 'تومان',
            matchedReason: reason,
            productData: product,
          });
        }
      });
    }

    // 3. Search Categories
    if (selectedTab === 'all' || selectedTab === 'categories') {
      categoryList.forEach((cat, idx) => {
        const catNameNorm = normalizePersian(cat.name);
        const catDescNorm = normalizePersian(cat.desc);

        if (catNameNorm.includes(cleanQuery) || catDescNorm.includes(cleanQuery)) {
          items.push({
            id: `cat-${idx}-${cat.name}`,
            type: 'category',
            title: cat.name,
            subtitle: cat.desc,
            description: `مشاهده تمام آیتم‌های دسته‌بندی ${cat.name} در سایت آکادمی فندق`,
            badge: cat.target === 'courses' ? 'دسته‌بندی دوره‌ها' : 'دسته‌بندی سفارشات',
            categoryTarget: cat.target,
          });
        }
      });
    }

    return items;
  }, [query, selectedTab, courses, products, categoryList]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Handle keyboard navigation inside results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex(prev => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex(prev => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[activeIndex]) {
        handleSelectItem(results[activeIndex]);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector<HTMLElement>(`[data-search-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();
    setCurrentView('landing');

    if (item.type === 'course' && item.courseData) {
      setTimeout(() => {
        setSelectedCourseForDetail(item.courseData!);
      }, 80);
    } else if (item.type === 'product' && item.productData) {
      setTimeout(() => {
        setSelectedProductForOrder(item.productData!);
      }, 80);
    } else if (item.type === 'category') {
      const targetId = item.categoryTarget === 'courses' ? 'courses' : 'products';
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  if (!isOpen) return null;

  // Highlight matched text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const cleanHighlight = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanHighlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          normalizePersian(part) === normalizePersian(highlight.trim()) ? (
            <mark key={i} className="bg-amber-200/80 text-amber-950 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] mt-4 sm:mt-10 text-right animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-amber-800 absolute right-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="جستجوی سریع دوره، کارگاه، کیک، دسر، مواد اولیه، سرفصل یا مدرس..."
              className="w-full pr-11 pl-20 py-3 text-sm sm:text-base font-medium text-stone-900 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 placeholder-stone-400 shadow-2xs transition-all"
            />
            <div className="absolute left-2.5 flex items-center gap-1.5">
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                  title="پاک کردن متن"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="hidden sm:inline-flex items-center px-2 py-1 text-[11px] font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors"
                title="بستن (Esc)"
              >
                Esc
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-3.5 overflow-x-auto pb-1 text-xs font-medium no-scrollbar">
            <span className="text-stone-400 text-[11px] shrink-0 ml-1">فیلتر نتایج:</span>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'all'
                  ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              همه آیتم‌ها
            </button>
            <button
              onClick={() => setSelectedTab('courses')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'courses'
                  ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>دوره‌های آموزشی</span>
            </button>
            <button
              onClick={() => setSelectedTab('products')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'products'
                  ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <Cake className="w-3.5 h-3.5" />
              <span>کیک و دسر</span>
            </button>
            <button
              onClick={() => setSelectedTab('categories')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'categories'
                  ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>دسته‌بندی‌ها</span>
            </button>
          </div>
        </div>

        {/* Results Container / Empty State */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
          {!query.trim() ? (
            // Idle State: Popular Searches & Categories Quick Access
            <div className="py-6 px-2">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-stone-700 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>جستجوهای پرطرفدار و پیشنهادی هنرجویان و مشتریان</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(tag);
                        inputRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-amber-100/70 hover:text-amber-900 border border-stone-200/80 rounded-xl transition-all shadow-2xs active:scale-95"
                    >
                      <Tag className="w-3 h-3 text-amber-800/70" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick overview counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100">
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-800 flex items-center justify-center text-amber-50">
                      <GraduationCap className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">دوره‌های آموزشگاهی فعال</div>
                      <div className="text-[11px] text-stone-500">کارگاه‌های تخصصی با مدرک بین‌المللی</div>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-amber-900 tabular-nums">
                    {courses.length} دوره
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-800 flex items-center justify-center text-amber-50">
                      <Cake className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">سفارشات کیک و دسر</div>
                      <div className="text-[11px] text-stone-500">کیک تولد، عروسی، دسر بوتیکی</div>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-amber-900 tabular-nums">
                    {products.length} محصول
                  </span>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            // No Results Found
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 mb-1">
                نتیجه‌ای برای «{query}» یافت نشد
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                می‌توانید عنوان کلی‌تری مثل «کیک»، «ورکشاپ»، «نان»، یا نام مواد اولیه مثل «شکلات» را جستجو نمایید.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['کیک تولد', 'ورکشاپ فوندانت', 'دسر مدرن', 'شیرینی عید'].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Results List
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 text-[11px] text-stone-500">
                <span>تعداد نتایج یافت‌شده: <strong className="text-amber-900 font-bold tabular-nums">{results.length}</strong> مورد</span>
                <span className="hidden sm:inline">از کلیدهای ↑ و ↓ برای پیمایش و Enter برای انتخاب استفاده کنید</span>
              </div>

              {results.map((item, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={item.id}
                    data-search-index={index}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`group p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-amber-50/80 border-amber-300/80 shadow-xs ring-1 ring-amber-300'
                        : 'bg-white hover:bg-stone-50 border-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Thumbnail or Icon */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl object-cover shrink-0 border border-stone-200 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-amber-100/70 border border-amber-200/70 flex items-center justify-center shrink-0 text-amber-900">
                          {item.type === 'category' ? (
                            <FolderTree className="w-6 h-6 text-amber-800" />
                          ) : item.type === 'course' ? (
                            <GraduationCap className="w-6 h-6 text-amber-800" />
                          ) : (
                            <Cake className="w-6 h-6 text-amber-800" />
                          )}
                        </div>
                      )}

                      {/* Main Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.type === 'course'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : item.type === 'product'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                          <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-amber-900 transition-colors">
                            {renderHighlightedText(item.title, query)}
                          </h4>
                        </div>

                        <p className="text-xs text-stone-500 truncate mb-1">
                          {renderHighlightedText(item.subtitle, query)}
                        </p>

                        {/* Matched reason if specific (e.g. syllabus item or ingredient) */}
                        {item.matchedReason && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>{renderHighlightedText(item.matchedReason, query)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Action Button */}
                    <div className="shrink-0 text-left flex flex-col items-end gap-1.5 pl-1">
                      {item.price !== undefined && (
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-amber-950 tabular-nums">
                            {item.price.toLocaleString('fa-IR')}
                          </span>
                          <span className="text-[10px] text-stone-500 mr-1">{item.priceSuffix}</span>
                        </div>
                      )}

                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-800 text-white shadow-2xs'
                            : 'text-stone-600 bg-stone-100 group-hover:bg-amber-100 group-hover:text-amber-900'
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {item.type === 'course'
                            ? 'مشاهده سرفصل و ثبت‌نام'
                            : item.type === 'product'
                            ? 'سفارش و شخصی‌سازی'
                            : 'نمایش بخش'}
                        </span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3 sm:px-5 sm:py-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded shadow-2xs">Enter</kbd>
              <span>انتخاب و مشاهده</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded shadow-2xs">↓</kbd>
              <span>جابجایی</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded shadow-2xs">Esc</kbd>
              <span>بستن</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-stone-400">
            <span>آکادمی و استودیو شیرینی‌پزی فندق</span>
          </div>
        </div>
      </div>
    </div>
  );
};
