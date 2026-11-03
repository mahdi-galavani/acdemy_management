import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { Search, Trash2, Phone, Calendar, MapPin, CheckCircle, Clock, PackageCheck, AlertCircle } from 'lucide-react';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'در انتظار تایید', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  in_progress: { label: 'در حال آماده‌سازی کارگاهی', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  ready: { label: 'آماده ارسال / تحویل', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  delivered: { label: 'تحویل داده شد', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'لغو شده', color: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export const OrdersManager: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">سفارشات آنلاین کیک و دسر مشتریان</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            بررسی مشخصات تحویل، فیلینگ انتخابی، متن روی کیک و تغییر وضعیت سفارش
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs flex items-center gap-3">
          <span className="text-stone-500">ارزش کل سفارشات فعال:</span>
          <span className="font-extrabold text-stone-900 tabular-nums">
            {totalRevenue.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی شماره سفارش، نام مشتری یا تلفن..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار تایید</option>
            <option value="in_progress">در حال آماده‌سازی</option>
            <option value="ready">آماده تحویل</option>
            <option value="delivered">تحویل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>

      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-stone-400 bg-white rounded-2xl border border-stone-200 text-xs">
            سفارشی با این فیلتر ثبت نشده است.
          </div>
        ) : (
          filteredOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 text-xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="font-bold text-stone-800">{order.customerName}</span>
                    <span className="text-stone-400">·</span>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-amber-800 hover:underline flex items-center gap-1 font-mono tabular-nums"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status selector */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none ${
                        STATUS_LABELS[order.status].color
                      }`}
                    >
                      <option value="pending">در انتظار تایید</option>
                      <option value="in_progress">در حال آماده‌سازی</option>
                      <option value="ready">آماده ارسال/تحویل</option>
                      <option value="delivered">تحویل داده شد</option>
                      <option value="cancelled">لغو سفارش</option>
                    </select>

                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف سفارش شماره ${order.orderNumber} اطمینان دارید؟`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="حذف سفارش"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{item.product.title}</span>
                          <span className="font-bold tabular-nums text-stone-800">
                            {item.quantity} عدد
                          </span>
                        </div>

                        {item.weightKg && (
                          <span className="text-[11px] text-stone-500 block tabular-nums">
                            وزن کیک: {item.weightKg} کیلوگرم
                          </span>
                        )}

                        {item.selectedFilling && (
                          <span className="text-[11px] text-amber-900 font-medium block">
                            فیلینگ: {item.selectedFilling}
                          </span>
                        )}

                        {item.cakeText && (
                          <span className="text-[11px] text-stone-700 italic block">
                            متن روی کیک: «{item.cakeText}»
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery details and notes */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-stone-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-800" />
                      <span>زمان تحویل مورد نظر: {order.deliveryDate}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                      <span>آدرس: {order.deliveryAddress}</span>
                    </div>
                    {order.notes && (
                      <div className="text-[11px] text-amber-900 font-medium">
                        تذکرات خریدار: {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-[11px] text-stone-500 block">مبلغ کل فاکتور:</span>
                    <span className="text-base font-black text-stone-900 tabular-nums">
                      {order.totalAmount.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
