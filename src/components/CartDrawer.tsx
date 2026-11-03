import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, ShoppingBag, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartItemQty,
    createOrder,
    showToast,
  } = useApp();

  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim() || !deliveryDate.trim()) {
      showToast('لطفاً کلیه فیلدهای الزامی تحویل را تکمیل فرمایید.', 'error');
      return;
    }

    const orderNum = createOrder({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: deliveryAddress.trim(),
      deliveryDate: deliveryDate.trim(),
      notes: orderNotes.trim() || undefined,
    });

    setConfirmedOrderNumber(orderNum);
  };

  const handleClose = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutStep(false);
    setConfirmedOrderNumber(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm flex justify-start animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-stone-900 text-base">سبد سفارشات قنادی فندق</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="بستن سبد"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {confirmedOrderNumber ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 my-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-emerald-950 text-lg">سفارش شما با موفقیت ثبت گردید!</h4>
              <div className="p-3 bg-white rounded-xl border border-emerald-200/80 inline-block">
                <span className="text-xs text-stone-500 block mb-0.5">کد رهگیری سفارش فندق:</span>
                <span className="text-base font-black text-emerald-800 tracking-wider font-mono">
                  {confirmedOrderNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                سفارش شما در سامانه مدیریت آتلیه فندق ثبت شد. همکاران ما جهت تایید نهایی جزئیات فیلینگ و هماهنگی زمان تحویل با شماره تلفن شما تماس خواهند گرفت.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs"
              >
                تایید و بازگشت به سایت
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-stone-500 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-medium">سبد سفارش شما در حال حاضر خالی است.</p>
              <p className="text-xs text-stone-400">
                از بخش محصولات کیک و دسر دیدن کنید و طعم‌های دلخواهتان را بیافزایید.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-4 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
              >
                مشاهده کیک‌ها و دسرها
              </button>
            </div>
          ) : !isCheckoutStep ? (
            /* Itemized list */
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex gap-3 text-xs"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 leading-snug">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.weightKg && (
                        <span className="text-[11px] text-stone-500 block mt-0.5 tabular-nums">
                          وزن: {item.weightKg} کیلوگرم
                        </span>
                      )}

                      {item.selectedFilling && (
                        <span className="text-[11px] text-amber-900 block mt-0.5 line-clamp-1">
                          فیلینگ: {item.selectedFilling}
                        </span>
                      )}

                      {item.cakeText && (
                        <span className="text-[11px] text-stone-600 italic block mt-0.5 line-clamp-1">
                          متن روی کیک: «{item.cakeText}»
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
                      <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateCartItemQty(item.id, -1)}
                          className="text-stone-600 hover:text-stone-900 font-bold px-1"
                        >
                          -
                        </button>
                        <span className="font-bold tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQty(item.id, 1)}
                          className="text-stone-600 hover:text-stone-900 font-bold px-1"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-stone-900 tabular-nums">
                        {item.totalPrice.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-stone-500">تومان</span>
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Checkout Form */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800">اطلاعات تحویل‌گیرنده:</span>
                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="text-xs text-amber-800 font-medium hover:underline flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>بازگشت به اقلام سبد</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  نام و نام خانوادگی خریدار <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثلاً: شیما محمدی"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  شماره تماس هماهنگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="۰۹۱۲..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  تاریخ و ساعت مورد نظر تحویل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  placeholder="مثلاً: پنج‌شنبه ۲۲ آذر - ساعت ۱۷ الی ۱۹"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  آدرس دقیق محل تحویل <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="استان، شهر، خیابان، پلاک، واحد..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  توضیحات و تذکرات ویژه
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="مثلاً: زنگ واحد ۳ زده شود، کلمن یخ همراه باشد"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>
            </form>
          )}

        </div>

        {/* Footer Checkout Strip */}
        {cart.length > 0 && !confirmedOrderNumber && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600">مجموع قابل پرداخت:</span>
              <span className="text-base font-black text-stone-900 tabular-nums">
                {totalAmount.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-stone-500">تومان</span>
              </span>
            </div>

            {!isCheckoutStep ? (
              <button
                type="button"
                onClick={() => setIsCheckoutStep(true)}
                className="w-full py-3 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>ادامه و تکمیل مشخصات تحویل</span>
              </button>
            ) : (
              <button
                form="checkout-form"
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>ثبت نهایی سفارش و دریافت کد رهگیری</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
