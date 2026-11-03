import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Plus, Clock, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForOrder } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      
      {/* Product Image Container */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_culinary_pastry_1793696672801.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
        
        {/* Unboxed Metadata on image */}
        <div className="absolute bottom-3 right-3 text-xs text-stone-200 font-medium flex items-center gap-1.5">
          <span>{product.subcategory}</span>
          <span aria-hidden="true">·</span>
          <span>حداقل {product.leadTimeDays} روز قبل</span>
        </div>

        {product.isPopular && (
          <div className="absolute top-3 right-3 text-[11px] font-bold text-amber-900 bg-amber-100/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-xs">
            پرفروش ویژه
          </div>
        )}
      </div>

      {/* Product Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors leading-snug line-clamp-1">
            {product.title}
          </h3>

          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Key ingredients preview */}
          <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-stone-500">
            {product.ingredients.slice(0, 3).map((ing, i) => (
              <span key={i} className="inline-block">
                {ing}
                {i < Math.min(product.ingredients.length, 3) - 1 ? '، ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-500">
              {product.isPerKg ? 'قیمت هر کیلوگرم:' : 'قیمت بسته:'}
            </span>
            <span className="text-base font-extrabold text-stone-900 tabular-nums">
              {product.price.toLocaleString('fa-IR')}{' '}
              <span className="text-xs font-normal text-stone-500">تومان</span>
            </span>
          </div>

          <button
            onClick={() => setSelectedProductForOrder(product)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>سفارش کیک / دسر</span>
          </button>
        </div>

      </div>

    </div>
  );
};
