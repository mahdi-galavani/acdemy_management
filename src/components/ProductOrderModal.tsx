import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, ShoppingBag, Clock, Sparkles } from 'lucide-react';

const FILLING_OPTIONS = [
  'موز، گردو و سس کارامل دست‌ساز فندق',
  'نوتلا بلژیکی و پرالین فندق تست شده کرانچی',
  'توت‌فرنگی، تمشک جنگلی و کرم پاتیسیر دیپلمات',
  'پسته اعلای قزوین و کرم چیز لوتوس کاراملی',
  'گاناش شکلات تلخ ۵۴٪ بلژیک و مغز گردو'
];

export const ProductOrderModal: React.FC = () => {
  const { selectedProductForOrder, setSelectedProductForOrder, addToCart } = useApp();

  const product = selectedProductForOrder;

  const [weightKg, setWeightKg] = useState<number>(product?.minWeightKg || 2);
  const [selectedFilling, setSelectedFilling] = useState<string>(FILLING_OPTIONS[0]);
  const [cakeText, setCakeText] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) return null;

  const isCake = product.category === 'cakes';
  const effectiveWeight = product.isPerKg ? weightKg : 1;
  const totalPrice = product.price * effectiveWeight * quantity;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      product,
      quantity,
      weightKg: product.isPerKg ? weightKg : undefined,
      selectedFilling: isCake ? selectedFilling : undefined,
      cakeText: isCake && cakeText.trim() ? cakeText.trim() : undefined,
      specialNotes: specialNotes.trim() || undefined,
      unitPrice: product.price,
      totalPrice,
    });
    setSelectedProductForOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative text-right">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForOrder(null)}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
          aria-label="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Preview */}
        <div className="p-6 border-b border-stone-100 flex items-center gap-4">
          <img
            src={product.image}
            alt={product.title}
            className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-stone-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs text-amber-900 font-medium flex items-center gap-1.5">
              <span>{product.subcategory}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-stone-500">
                <Clock className="w-3 h-3" />
                حداقل {product.leadTimeDays} روز قبل سفارش دهید
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-1 leading-snug">
              {product.title}
            </h2>
            <p className="text-xs text-stone-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="p-6 space-y-6">
          
          {/* Weight Selection (if sold per kg) */}
          {product.isPerKg && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800">
                  وزن تقریبی کیک را انتخاب فرمایید:
                </label>
                <span className="text-xs font-extrabold text-amber-900 tabular-nums">
                  {weightKg} کیلوگرم
                  <span className="text-stone-400 font-normal mr-1">
                    (مناسب برای {(weightKg * 6).toLocaleString('fa-IR')} الی {(weightKg * 8).toLocaleString('fa-IR')} نفر)
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[1.5, 2, 2.5, 3, 4, 5, 6].map((w) => {
                  if (product.minWeightKg && w < product.minWeightKg) return null;
                  const isSelected = weightKg === w;
                  return (
                    <button
                      type="button"
                      key={w}
                      onClick={() => setWeightKg(w)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center tabular-nums ${
                        isSelected
                          ? 'border-amber-800 bg-amber-50 text-amber-900 font-bold shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {w} کیلوگرم
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filling choice (for cakes) */}
          {isCake && (
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                انتخاب فیلینگ و مغزیجات میانی:
              </label>
              <div className="space-y-2">
                {FILLING_OPTIONS.map((filling) => {
                  const isSelected = selectedFilling === filling;
                  return (
                    <button
                      type="button"
                      key={filling}
                      onClick={() => setSelectedFilling(filling)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all text-right ${
                        isSelected
                          ? 'border-amber-800 bg-amber-50/80 text-amber-950 font-medium'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <span>{filling}</span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-stone-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text on Cake (for cakes) */}
          {isCake && (
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                متن دلخواه روی کیک (اختیاری):
              </label>
              <input
                type="text"
                value={cakeText}
                onChange={(e) => setCakeText(e.target.value)}
                placeholder="مثال: تولدت مبارک سارای عزیزم / Happy 25th Birthday"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs text-stone-900"
              />
            </div>
          )}

          {/* Special notes & dietary */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              یادداشت یا تغییر رنگ تم / آلرژی:
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="مثال: رنگ گل‌ها به جای صورتی یاسی باشد / بدون مغز گردو"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-xs text-stone-900 resize-none"
            />
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-800">تعداد:</span>
            <div className="flex items-center gap-3 bg-stone-100 px-3 py-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center text-sm font-bold shadow-xs hover:bg-stone-50"
              >
                -
              </button>
              <span className="text-xs font-bold tabular-nums w-4 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center text-sm font-bold shadow-xs hover:bg-stone-50"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer with Price & Submit */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 block">جمع قیمت سفارش:</span>
            <span className="text-lg font-extrabold text-stone-900 tabular-nums block">
              {totalPrice.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>افزودن به سبد سفارشات</span>
          </button>
        </div>

      </div>
    </div>
  );
};
