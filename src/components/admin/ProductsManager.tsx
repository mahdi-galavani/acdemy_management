import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategoryType } from '../../types';
import { Plus, Edit2, Trash2, X, Sparkles, Image as ImageIcon } from 'lucide-react';

const CATEGORY_MAP: Record<ProductCategoryType, { label: string; subcategories: string[] }> = {
  cakes: {
    label: 'کیک‌های سفارشی',
    subcategories: ['تولد', 'عروسی و نامزدی', 'دورهمی و عصرانه', 'پسرانه', 'دخترانه', 'مدرن و فانتزی']
  },
  desserts: {
    label: 'دسرهای فرانسوی و مدرن',
    subcategories: ['فرانسوی و مدرن', 'شات دسر و مجلسی', 'تک‌نفره و موس']
  },
  dry_pastries: {
    label: 'شیرینی خشک و سنتی',
    subcategories: ['سنتی و اعلا', 'مدرن و فانتزی', 'شیرینی عید']
  },
  finger_foods: {
    label: 'فینگرفود و شورینی',
    subcategories: ['تارت شور', 'سینی مزه', 'مینی برگر و کلاب']
  }
};

const IMAGE_PRESETS = [
  { label: 'کیک عروسی و نامزدی', path: '/src/assets/images/product_wedding_cake_1793696673644.jpg' },
  { label: 'کیک شکلات و قنادی', path: '/src/assets/images/hero_culinary_pastry_1793696672801.jpg' },
  { label: 'دسرهای فرانسوی و تارت', path: '/src/assets/images/product_french_dessert_1793696674459.jpg' },
  { label: 'شیرینی سنتی و باقلوا', path: '/src/assets/images/product_traditional_pastry_1793696674841.jpg' }
];

export const ProductsManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<ProductCategoryType>('cakes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategoryType>('cakes');
  const [subcategory, setSubcategory] = useState(CATEGORY_MAP.cakes.subcategories[0]);
  const [price, setPrice] = useState<number>(850000);
  const [isPerKg, setIsPerKg] = useState(true);
  const [minWeightKg, setMinWeightKg] = useState<number>(2);
  const [image, setImage] = useState(IMAGE_PRESETS[0].path);
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('شکلات بلژیکی، خامه تازه، پسته، کارامل');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);
  const [inStock, setInStock] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory(activeTab);
    setSubcategory(CATEGORY_MAP[activeTab].subcategories[0]);
    setPrice(activeTab === 'cakes' ? 850000 : 600000);
    setIsPerKg(activeTab === 'cakes');
    setMinWeightKg(activeTab === 'cakes' ? 2 : 1);
    setImage(
      activeTab === 'cakes'
        ? IMAGE_PRESETS[0].path
        : activeTab === 'desserts'
        ? IMAGE_PRESETS[2].path
        : IMAGE_PRESETS[3].path
    );
    setDescription('');
    setIngredientsText('مواد تازه، آرد مرغوب، کره فرانسوی');
    setLeadTimeDays(2);
    setInStock(true);
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setSubcategory(p.subcategory);
    setPrice(p.price);
    setIsPerKg(p.isPerKg);
    setMinWeightKg(p.minWeightKg || 1);
    setImage(p.image);
    setDescription(p.description);
    setIngredientsText(p.ingredients.join('، '));
    setLeadTimeDays(p.leadTimeDays);
    setInStock(p.inStock);
    setIsPopular(Boolean(p.isPopular));
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCat: ProductCategoryType) => {
    setCategory(newCat);
    setSubcategory(CATEGORY_MAP[newCat].subcategories[0]);
    setIsPerKg(newCat === 'cakes');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('لطفاً عنوان محصول را وارد فرمایید.', 'error');
      return;
    }

    const ingredients = ingredientsText
      .split(/[,،]+/)
      .map((i) => i.trim())
      .filter(Boolean);

    const productData = {
      title: title.trim(),
      category,
      subcategory,
      price: Number(price),
      isPerKg,
      minWeightKg: isPerKg ? Number(minWeightKg) : undefined,
      image,
      description: description.trim() || 'محصول قنادی اعلا آموزشگاه و آتلیه فندق',
      ingredients,
      leadTimeDays: Number(leadTimeDays),
      inStock,
      isPopular,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setIsModalOpen(false);
  };

  const currentProducts = products.filter((p) => p.category === activeTab);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">مدیریت منوی محصولات و سفارشات کیک</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            دسته‌بندی‌های داینامیک: کیک‌های تولد، عروسی، پسرانه، دخترانه، دسرها و شیرینی خشک
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl overflow-x-auto no-scrollbar">
        {(Object.keys(CATEGORY_MAP) as ProductCategoryType[]).map((catKey) => {
          const count = products.filter((p) => p.category === catKey).length;
          return (
            <button
              key={catKey}
              onClick={() => setActiveTab(catKey)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === catKey
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {CATEGORY_MAP[catKey].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentProducts.length === 0 ? (
          <div className="col-span-full py-14 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            محصولی در این دسته‌بندی ثبت نشده است. با دکمه «افزودن محصول جدید» شروع کنید.
          </div>
        ) : (
          currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-stone-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-stone-900/80 text-white">
                    {product.subcategory}
                  </div>
                  {product.isPopular && (
                    <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                      محبوب
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {product.isPerKg ? 'قیمت هر کیلو:' : 'قیمت:'}
                  </span>
                  <span className="font-extrabold text-stone-900 tabular-nums">
                    {product.price.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className={`text-[11px] font-medium ${product.inStock ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {product.inStock ? '✓ آماده پذیرش سفارش' : 'ناموجود'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-amber-900"
                    title="ویرایش"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`آیا از حذف محصول «${product.title}» اطمینان دارید؟`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingProduct ? 'ویرایش اطلاعات محصول' : 'افزودن محصول جدید به منوی فندق'}
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
                  نام محصول <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: کیک تولد شکلات و فندق بلژیکی"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    دسته اصلی
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as ProductCategoryType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  >
                    {(Object.keys(CATEGORY_MAP) as ProductCategoryType[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_MAP[cat].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    زیردسته اختصاصی
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  >
                    {CATEGORY_MAP[category].subcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    قیمت (تومان) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    حداقل زمان آماده‌سازی (روز)
                  </label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    محاسبه قیمت
                  </label>
                  <select
                    value={isPerKg ? 'perKg' : 'flat'}
                    onChange={(e) => setIsPerKg(e.target.value === 'perKg')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                  >
                    <option value="perKg">به ازای هر کیلوگرم</option>
                    <option value="flat">قیمت ثابت هر بسته/عدد</option>
                  </select>
                </div>
              </div>

              {/* Image selector */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  انتخاب تصویر باکیفیت برای محصول:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {IMAGE_PRESETS.map((preset) => {
                    const isSelected = image === preset.path;
                    return (
                      <button
                        type="button"
                        key={preset.path}
                        onClick={() => setImage(preset.path)}
                        className={`rounded-xl overflow-hidden border-2 relative transition-all text-right ${
                          isSelected ? 'border-amber-800 ring-2 ring-amber-800/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.path} alt={preset.label} className="w-full h-16 object-cover" />
                        <span className="block p-1 text-[9px] font-bold text-stone-800 truncate bg-white">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  مواد اولیه و تشکیل‌دهنده (با کاما جدا کنید)
                </label>
                <input
                  type="text"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="مثال: شکلات بلژیکی، مغز گردو، کارامل دست‌ساز، پسته"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  توضیحات و مشخصات ظاهری
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحاتی در مورد طعم، بافت، لایه‌بندی و مناسبت"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded text-amber-800 focus:ring-amber-800"
                  />
                  <span className="font-semibold text-stone-800">امکان ثبت سفارش فعال است</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-amber-800 focus:ring-amber-800"
                  />
                  <span className="font-semibold text-stone-800">برچسب پرفروش ویژه</span>
                </label>
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
                  ذخیره محصول
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
