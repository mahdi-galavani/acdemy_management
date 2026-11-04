import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import {
  Search,
  X,
  GraduationCap,
  Cake,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  MessageSquare,
  AlertCircle,
  FileCheck,
  Server
} from 'lucide-react';
import { Student, Order, OrderStatus } from '../types';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string; desc: string }> = {
  pending: {
    label: 'در انتظار بررسی آتلیه',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'سفارش شما در صف تایید کارشناس قنادی قرار دارد.',
  },
  in_progress: {
    label: 'در حال پخت و تزیین در کارگاه',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    desc: 'شف‌های آتلیه در حال پخت اسفنج و اجرای دیزاین و فیلینگ هستند.',
  },
  ready: {
    label: 'آماده تحویل / بسته‌بندی شده',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    desc: 'کیک شما در باکس مخصوص یخچال‌دار آماده ارسال یا تحویل حضوری است.',
  },
  delivered: {
    label: 'تحویل داده شد',
    color: 'bg-stone-100 text-stone-700 border-stone-300',
    desc: 'سفارش با موفقیت به مشتری تحویل داده شده است.',
  },
  cancelled: {
    label: 'لغو شده',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    desc: 'این سفارش لغو شده است.',
  },
};

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose }) => {
  const { students, orders, siteSettings } = useApp();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [serverCertificates, setServerCertificates] = useState<any[]>([]);
  const [serverOrders, setServerOrders] = useState<any[]>([]);

  if (!isOpen) return null;

  const cleanDigits = (str: string) => {
    return str
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[^0-9a-zA-Z-]/g, '')
      .toLowerCase();
  };

  const normalizedQuery = cleanDigits(query);

  // Local Search results
  const matchedStudent: Student | undefined = query.trim()
    ? students.find((s) => {
        const studentPhone = cleanDigits(s.phone);
        const studentNat = cleanDigits(s.nationalCode);
        return studentPhone.includes(normalizedQuery) || (normalizedQuery.length >= 8 && studentNat.includes(normalizedQuery));
      })
    : undefined;

  const matchedOrders: Order[] = query.trim()
    ? orders.filter((o) => {
        const orderPhone = cleanDigits(o.customerPhone);
        const orderNum = cleanDigits(o.orderNumber);
        return orderPhone.includes(normalizedQuery) || orderNum.includes(normalizedQuery);
      })
    : [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    setIsSearchingApi(true);

    try {
      const res = await api.searchInquiry(query.trim());
      if (res.success && res.data) {
        setServerCertificates(res.data.certificates || []);
        setServerOrders(res.data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleQuickDemo = (sampleVal: string) => {
    setQuery(sampleVal);
    setHasSearched(true);
    setIsSearchingApi(true);
    api.searchInquiry(sampleVal).then((res) => {
      if (res.success && res.data) {
        setServerCertificates(res.data.certificates || []);
        setServerOrders(res.data.orders || []);
      }
      setIsSearchingApi(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                پیگیری وضعیت سفارش و استعلام سوابق هنرجو
              </h3>
              <p className="text-xs text-stone-500">
                مشاهده لحظه‌ای وضعیت گواهی‌های دوره و مراحل آماده‌سازی کیک و دسر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              شماره همراه خود را وارد فرمایید (یا کد پیگیری سفارش):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!hasSearched) setHasSearched(true);
                  }}
                  placeholder="مثلاً: ۰۹۱۲۱۱۱۲۲۳۳ یا FND-8491"
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs font-medium tabular-nums shadow-xs"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                جستجو و استعلام
              </button>
            </div>

            {/* Quick Demo Samples */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
              <span>نمونه جهت تست:</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('۰۹۱۲۱۱۱۲۲۳۳')}
                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 font-mono text-[10px] transition-colors"
              >
                سارا میرزایی (هنرجوی دو دوره)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('FND-8491')}
                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 font-mono text-[10px] transition-colors"
              >
                سفارش کیک FND-8491
              </button>
            </div>
          </form>

          {/* RESULTS AREA */}
          {hasSearched && (
            <div className="space-y-5 pt-2">
              
              {/* Case 1: Student Record Found */}
              {matchedStudent && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-900" />
                      <div>
                        <span className="font-extrabold text-sm text-stone-900">
                          پرونده هنرجو: {matchedStudent.fullName}
                        </span>
                        <span className="text-[11px] text-stone-500 block">
                          تعداد دوره‌های ثبت‌نامی: {matchedStudent.enrollments?.length || 1} دوره
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 text-xs font-bold font-mono">
                      {matchedStudent.phone}
                    </span>
                  </div>

                  {/* List of enrolled courses */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-800 block">دوره‌های ثبت‌نام شده:</span>
                    {(matchedStudent.enrollments || []).map((enr, idx) => {
                      const remaining = (enr.tuitionTotal || 0) - (enr.tuitionPaid || 0);
                      return (
                        <div
                          key={enr.id || idx}
                          className="p-3.5 rounded-xl bg-white border border-amber-100 shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <span className="font-bold text-stone-900">{enr.courseTitle}</span>
                            <span className="text-[11px] text-stone-400">ثبت‌نام: {enr.enrolledAt}</span>
                          </div>

                          {/* Certificate Badge */}
                          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-stone-50">
                            <div className="flex items-center gap-1.5">
                              {enr.certificateIssued ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  گواهینامه بین‌المللی صادر شده است (آماده تحویل)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 border border-stone-200 font-medium text-[11px]">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  دوره در حال برگزاری / آزمون عملی پیش‌رو
                                </span>
                              )}
                            </div>

                            <span className={`text-[11px] font-bold ${remaining === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                              {remaining === 0 ? '✓ شهریه تسویه کامل' : `مانده شهریه: ${remaining.toLocaleString('fa-IR')} تومان`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Case 2: Pastry Orders Found */}
              {matchedOrders.length > 0 && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/90 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                    <div className="flex items-center gap-2">
                      <Cake className="w-5 h-5 text-purple-900" />
                      <span className="font-extrabold text-sm text-stone-900">
                        سفارشات کیک و دسر آتلیه ({matchedOrders.length} سفارش)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {matchedOrders.map((ord) => {
                      const statusConfig = ORDER_STATUS_LABELS[ord.status] || ORDER_STATUS_LABELS.pending;
                      return (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                              کد رهگیری: {ord.orderNumber}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="font-bold text-stone-800 text-xs">
                            {ord.items.map((i) => i.product.title).join(' + ')}
                          </div>

                          <p className="text-[11px] text-stone-500">{statusConfig.desc}</p>

                          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                            <span>تاریخ تحویل هماهنگ شده: <strong className="text-stone-800">{ord.deliveryDate}</strong></span>
                            <span>مبلغ کل فاکتور: <strong className="text-stone-900 tabular-nums">{ord.totalAmount.toLocaleString('fa-IR')} تومان</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Case 3: Nothing Found */}
              {!matchedStudent && matchedOrders.length === 0 && (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-700 mx-auto" />
                  <div>
                    <span className="font-bold text-xs text-stone-800 block">
                      رکوردی با شماره یا کد «{query}» یافت نشد.
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1 max-w-md mx-auto">
                      لطفاً شماره همراهی را وارد فرمایید که هنگام ثبت‌نام یا سفارش کیک ارائه کرده‌اید. در صورت هرگونه ابهام، همکاران ما آماده پاسخگویی هستند:
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {siteSettings.whatsappNumber && (
                      <a
                        href={`https://wa.me/98${siteSettings.whatsappNumber.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>ارتباط در واتساپ</span>
                      </a>
                    )}
                    <a
                      href={`tel:${siteSettings.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-300 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>تماس تلفنی با آموزشگاه ({siteSettings.phone})</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-3xl flex items-center justify-between text-xs text-stone-500">
          <span>پاسخگویی حضوری و تلفنی در ساعات کاری: {siteSettings.workingHours}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold transition-colors"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
