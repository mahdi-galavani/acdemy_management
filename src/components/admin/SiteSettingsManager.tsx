import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SiteSettings, SocialLink, SocialPlatform } from '../../types';
import {
  Save,
  Globe,
  Layout,
  Phone,
  Share2,
  Sparkles,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  Server,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Instagram,
  Send,
  MessageSquare,
  MessageCircle,
  Video,
  Youtube,
  Radio,
  Linkedin,
  Bookmark,
  Link as LinkIcon
} from 'lucide-react';

const HERO_IMAGE_PRESETS = [
  { label: 'کارگاه عملی قنادی و دکوراتوری کیک', path: '/src/assets/images/hero_culinary_pastry_1793696672801.jpg' },
  { label: 'کیک مجلل عروسی و فوندانت', path: '/src/assets/images/product_wedding_cake_1793696673644.jpg' },
  { label: 'دسرهای فرانسوی و پتیسری مدرن', path: '/src/assets/images/product_french_dessert_1793696674459.jpg' },
  { label: 'شیرینی سنتی و باقلوا اعلا', path: '/src/assets/images/product_traditional_pastry_1793696674841.jpg' },
];

const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; defaultTitle: string; defaultUrlPrefix: string }> = {
  instagram: { label: 'اینستاگرام (Instagram)', defaultTitle: 'پیج اینستاگرام', defaultUrlPrefix: 'https://instagram.com/' },
  telegram: { label: 'تلگرام (Telegram)', defaultTitle: 'کانال تلگرام', defaultUrlPrefix: 'https://t.me/' },
  eitaa: { label: 'ایتا (Eitaa)', defaultTitle: 'کانال ایتا', defaultUrlPrefix: 'https://eitaa.com/' },
  bale: { label: 'بله (Bale)', defaultTitle: 'کانال بله', defaultUrlPrefix: 'https://ble.ir/' },
  whatsapp: { label: 'واتساپ (WhatsApp)', defaultTitle: 'پشتیبانی واتساپ', defaultUrlPrefix: 'https://wa.me/' },
  rubika: { label: 'روبیکا (Rubika)', defaultTitle: 'کانال روبیکا', defaultUrlPrefix: 'https://rubika.ir/' },
  aparat: { label: 'آپارات (Aparat)', defaultTitle: 'کانال آپارات', defaultUrlPrefix: 'https://aparat.com/' },
  youtube: { label: 'یوتیوب (YouTube)', defaultTitle: 'کانال یوتیوب', defaultUrlPrefix: 'https://youtube.com/' },
  pinterest: { label: 'پینترست (Pinterest)', defaultTitle: 'پینترست نمونه‌کارها', defaultUrlPrefix: 'https://pinterest.com/' },
  linkedin: { label: 'لینکدین (LinkedIn)', defaultTitle: 'صفحه لینکدین', defaultUrlPrefix: 'https://linkedin.com/' },
  website: { label: 'وب‌سایت / وبلاگ', defaultTitle: 'وب‌سایت رسمی', defaultUrlPrefix: 'https://' },
  other: { label: 'سایر شبکه‌ها', defaultTitle: 'شبکه اجتماعی', defaultUrlPrefix: 'https://' },
};

export const getSocialIconComponent = (platform: SocialPlatform) => {
  switch (platform) {
    case 'instagram': return Instagram;
    case 'telegram': return Send;
    case 'eitaa': return MessageCircle;
    case 'bale': return Radio;
    case 'whatsapp': return MessageSquare;
    case 'rubika': return Share2;
    case 'aparat': return Video;
    case 'youtube': return Youtube;
    case 'pinterest': return Bookmark;
    case 'linkedin': return Linkedin;
    case 'website': return Globe;
    default: return LinkIcon;
  }
};

export const SiteSettingsManager: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'brand' | 'hero' | 'stats' | 'contact' | 'social'>('brand');

  // Form states initialized with current siteSettings
  const [formData, setFormData] = useState<SiteSettings>({
    ...siteSettings,
    socialLinks: siteSettings.socialLinks || []
  });

  // State for adding a new social link
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('instagram');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newHandle, setNewHandle] = useState('');

  const handleChange = (field: keyof SiteSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSocialLink = () => {
    if (!newUrl.trim()) return;

    const platformConfig = PLATFORM_CONFIG[newPlatform];
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: newPlatform,
      title: newTitle.trim() || platformConfig.defaultTitle,
      url: newUrl.trim(),
      handle: newHandle.trim() || undefined,
      isActive: true,
    };

    setFormData((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), newLink],
    }));

    // Reset form
    setNewTitle('');
    setNewUrl('');
    setNewHandle('');
    setIsAddingSocial(false);
  };

  const handleToggleSocialActive = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((link) =>
        link.id === id ? { ...link, isActive: !link.isActive } : link
      ),
    }));
  };

  const handleDeleteSocialLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((link) => link.id !== id),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-5xl text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">تنظیمات محتوایی و عمومی سایت</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            تغییر آنلاین کلیه متون هدر، فوتر، لوگو، تیترهای اصلی، اطلاعات تماس و آمارها بدون نیاز به کدنویسی
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-xs hover:shadow"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تغییرات سایت</span>
        </button>
      </div>

      {/* Backend Integration Note */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 text-amber-800 shrink-0" />
          <span>
            کلیه این مقادیر هم‌اکنون به صورت داینامیک در <strong>LocalStorage</strong> ذخیره می‌شوند و بعداً با یک متد <code>PUT /api/settings</code> مستقیماً از دیتابیس خوانده خواهند شد.
          </span>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('brand')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'brand' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-800" />
          <span>هدر و نام برند</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'hero' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-amber-800" />
          <span>بخش هیرو و تیترها</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'stats' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-800" />
          <span>آمارها و افتخارات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'contact' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-amber-800" />
          <span>تماس، آدرس و فوتر</span>
        </button>

        <button
          onClick={() => setActiveSubTab('social')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'social' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-amber-800" />
          <span>شبکه‌های اجتماعی و واتساپ</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6 text-xs">
        
        {/* Tab 1: Brand & Header */}
        {activeSubTab === 'brand' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              مشخصات هدر و هویت برند
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  نام اصلی آموزشگاه (Brand Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs font-bold"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">در هدر، عنوان برگه و لوگو نمایش داده می‌شود.</span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  زیرعنوان برند (Brand Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.brandSubtitle}
                  onChange={(e) => handleChange('brandSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">متن کوچک زیر لوگو در هدر (مثلاً: آکادمی تخصصی قنادی و پتیسری).</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                آدرس اینترنتی تصویر لوگو (اختیاری)
              </label>
              <input
                type="text"
                value={formData.logoImageUrl || ''}
                onChange={(e) => handleChange('logoImageUrl', e.target.value)}
                placeholder="در صورت خالی بودن، آیکون وکتوری زیبای آموزشگاه نمایش می‌یابد"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Hero Section */}
        {activeSubTab === 'hero' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              بخش هیرو (بنر اصلی بالای لندینگ پیج)
            </h3>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                برچسب بالای تیتر (Hero Badge Kicker)
              </label>
              <input
                type="text"
                value={formData.heroBadge}
                onChange={(e) => handleChange('heroBadge', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                تیتر اصلی صفحه اول (Headline) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.heroHeadline}
                onChange={(e) => handleChange('heroHeadline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs font-bold leading-relaxed resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                توضیحات معرفی و پاراگراف زیر تیتر (Description)
              </label>
              <textarea
                rows={3}
                value={formData.heroDescription}
                onChange={(e) => handleChange('heroDescription', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Hero Image Selection */}
            <div>
              <label className="block font-semibold text-stone-700 mb-2">
                تصویر اصلی هیرو (Hero Image):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {HERO_IMAGE_PRESETS.map((preset) => {
                  const isSelected = formData.heroImageUrl === preset.path;
                  return (
                    <button
                      type="button"
                      key={preset.path}
                      onClick={() => handleChange('heroImageUrl', preset.path)}
                      className={`rounded-xl overflow-hidden border-2 text-right transition-all relative ${
                        isSelected ? 'border-amber-800 ring-2 ring-amber-800/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.path} alt={preset.label} className="w-full h-24 object-cover" />
                      <span className="block p-1.5 text-[10px] font-bold text-stone-800 truncate bg-stone-50">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Key Statistics */}
        {activeSubTab === 'stats' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              نوارهای آمار کلیدی و اعتبارسنجی (زیر هیرو)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stat 1 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 block text-[11px]">آیتم ۱ (هنرجویان فارغ‌التحصیل):</span>
                <input
                  type="text"
                  value={formData.statGraduatesCount}
                  onChange={(e) => handleChange('statGraduatesCount', e.target.value)}
                  placeholder="مثلاً: +۲,۴۰۰"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-black tabular-nums"
                />
                <input
                  type="text"
                  value={formData.statGraduatesTitle}
                  onChange={(e) => handleChange('statGraduatesTitle', e.target.value)}
                  placeholder="عنوان (مثلاً: هنرجوی فارغ‌التحصیل)"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                />
                <input
                  type="text"
                  value={formData.statGraduatesDesc}
                  onChange={(e) => handleChange('statGraduatesDesc', e.target.value)}
                  placeholder="توضیح کوتاه (مثلاً: راه‌اندازی ۳۵۰ کسب‌وکار)"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-500"
                />
              </div>

              {/* Stat 2 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 block text-[11px]">آیتم ۲ (مدرک بین‌المللی):</span>
                <input
                  type="text"
                  value={formData.statCertificateTitle}
                  onChange={(e) => handleChange('statCertificateTitle', e.target.value)}
                  placeholder="مثلاً: ۱۰۰٪ معتبر"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-black"
                />
                <input
                  type="text"
                  value={formData.statCertificateSub}
                  onChange={(e) => handleChange('statCertificateSub', e.target.value)}
                  placeholder="عنوان (مثلاً: مدرک بین‌المللی سازمان فنی‌وحرفه‌ای)"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                />
                <input
                  type="text"
                  value={formData.statCertificateDesc}
                  onChange={(e) => handleChange('statCertificateDesc', e.target.value)}
                  placeholder="توضیح کوتاه (مثلاً: دارای کد ILO قابل ترجمه)"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-500"
                />
              </div>

              {/* Stat 3 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 block text-[11px]">آیتم ۳ (کارگاه عملی):</span>
                <input
                  type="text"
                  value={formData.statPracticalTitle}
                  onChange={(e) => handleChange('statPracticalTitle', e.target.value)}
                  placeholder="مثلاً: ۱۰۰٪ عملی"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-black"
                />
                <input
                  type="text"
                  value={formData.statPracticalSub}
                  onChange={(e) => handleChange('statPracticalSub', e.target.value)}
                  placeholder="عنوان"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                />
                <input
                  type="text"
                  value={formData.statPracticalDesc}
                  onChange={(e) => handleChange('statPracticalDesc', e.target.value)}
                  placeholder="توضیح کوتاه"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-500"
                />
              </div>

              {/* Stat 4 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 block text-[11px]">آیتم ۴ (پشتیبانی هنرجو):</span>
                <input
                  type="text"
                  value={formData.statSupportTitle}
                  onChange={(e) => handleChange('statSupportTitle', e.target.value)}
                  placeholder="مثلاً: ۶ ماه"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-black"
                />
                <input
                  type="text"
                  value={formData.statSupportSub}
                  onChange={(e) => handleChange('statSupportSub', e.target.value)}
                  placeholder="عنوان"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                />
                <input
                  type="text"
                  value={formData.statSupportDesc}
                  onChange={(e) => handleChange('statSupportDesc', e.target.value)}
                  placeholder="توضیح کوتاه"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Contact & Footer */}
        {activeSubTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              اطلاعات تماس، آدرس فیزیکی و متن فوتر
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  تلفن ثابت آموزشگاه <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  شماره همراه مشاوره و ثبت‌نام
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                آدرس کامل پستی آموزشگاه <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  ساعات کاری و پاسخگویی
                </label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  شماره پروانه و مجوز سازمان فنی‌وحرفه‌ای
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                متن معرفی فوتر (Footer Bio)
              </label>
              <textarea
                rows={3}
                value={formData.footerBio}
                onChange={(e) => handleChange('footerBio', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none text-xs resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Dynamic Social Links & WhatsApp */}
        {activeSubTab === 'social' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  شبکه‌های اجتماعی و پیام‌رسان‌ها (کاملاً داینامیک)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  امکان افزودن نامحدود کانال‌ها و صفحات اجتماعی (اینستاگرام، تلگرام، ایتا، بله، واتساپ، روبیکا، آپارات و...)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingSocial(!isAddingSocial)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingSocial ? 'بستن فرم افزودن' : 'افزودن شبکه جدید'}</span>
              </button>
            </div>

            {/* Add New Social Link Form Card */}
            {isAddingSocial && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3.5">
                <span className="font-bold text-xs text-amber-950 block">
                  ثبت مشخصات شبکه اجتماعی یا پیام‌رسان جدید:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      انتخاب پلتفرم <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newPlatform}
                      onChange={(e) => {
                        const plat = e.target.value as SocialPlatform;
                        setNewPlatform(plat);
                        if (!newTitle) setNewTitle(PLATFORM_CONFIG[plat].defaultTitle);
                        if (!newUrl) setNewUrl(PLATFORM_CONFIG[plat].defaultUrlPrefix);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    >
                      {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      عنوان نمایشی (Title)
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={PLATFORM_CONFIG[newPlatform].defaultTitle}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      آیدی / شناسه کاربری (Handle)
                    </label>
                    <input
                      type="text"
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      placeholder="مثلاً: @fandoq_pastry"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none ltr text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    لینک مستقیم و کامل اینترنتی (URL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://eitaa.com/fandoq_pastry"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none ltr text-left"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSocial(false)}
                    className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-800"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    disabled={!newUrl.trim()}
                    onClick={handleAddSocialLink}
                    className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    افزودن به لیست شبکه‌ها
                  </button>
                </div>
              </div>
            )}

            {/* List of Configured Social Links */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 block">
                شبکه‌های فعال و تعریف‌شده سایت ({formData.socialLinks?.length || 0}):
              </span>

              {(!formData.socialLinks || formData.socialLinks.length === 0) ? (
                <div className="p-6 text-center rounded-2xl bg-stone-50 border border-stone-200 text-stone-400 text-xs">
                  هیچ شبکه اجتماعی ثبت نشده است. روی دکمه «افزودن شبکه جدید» کلیک کنید.
                </div>
              ) : (
                <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
                  {formData.socialLinks.map((item) => {
                    const IconComponent = getSocialIconComponent(item.platform);
                    const config = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          item.isActive ? 'hover:bg-stone-50/70' : 'bg-stone-50/40 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.platform === 'instagram' ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white' :
                            item.platform === 'telegram' ? 'bg-sky-500 text-white' :
                            item.platform === 'eitaa' ? 'bg-amber-600 text-white' :
                            item.platform === 'bale' ? 'bg-emerald-600 text-white' :
                            item.platform === 'whatsapp' ? 'bg-emerald-500 text-white' :
                            item.platform === 'rubika' ? 'bg-purple-600 text-white' :
                            item.platform === 'aparat' ? 'bg-rose-600 text-white' :
                            item.platform === 'youtube' ? 'bg-red-600 text-white' :
                            item.platform === 'pinterest' ? 'bg-red-700 text-white' :
                            item.platform === 'linkedin' ? 'bg-blue-700 text-white' :
                            'bg-stone-700 text-white'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-stone-900">{item.title}</span>
                              <span className="text-[10px] text-stone-400 font-medium">({config.label})</span>
                              {!item.isActive && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-600 font-bold">
                                  غیرفعال در سایت
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                              {item.handle && <span className="font-mono text-stone-700">{item.handle}</span>}
                              {item.handle && <span>•</span>}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-800 hover:underline ltr font-mono truncate max-w-xs block"
                              >
                                {item.url}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSocialActive(item.id)}
                            title={item.isActive ? 'غیرفعال کردن نمایش در سایت' : 'فعال کردن نمایش'}
                            className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                              item.isActive
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {item.isActive ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px]">فعال</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                <span className="text-[10px]">مخفی</span>
                              </>
                            )}
                          </button>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                            title="تست لینک"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteSocialLink(item.id)}
                            className="p-2 rounded-lg border border-stone-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            title="حذف شبکه"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Contact Defaults (WhatsApp Hotline & Instagram shortcut) */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="font-bold text-xs text-stone-800 block">میانبرهای ارتباط مستقیم و واتساپ مشاوره:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    شماره واتساپ جهت مشاوره و ارسال عکس کیک:
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    placeholder="مثلاً: 09123456789"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    شناسه صفحه اصلی اینستاگرام:
                  </label>
                  <input
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) => handleChange('instagramHandle', e.target.value)}
                    placeholder="fandoq_pastry_academy"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Custom Cake Banner Settings */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="font-bold text-stone-800 block text-xs">بنر سفارش کیک‌های خاص (طرح دلخواه شما در پینترست/اینستاگرام):</span>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">تیتر بنر:</label>
                <input
                  type="text"
                  value={formData.ordersNoticeTitle}
                  onChange={(e) => handleChange('ordersNoticeTitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">متن توضیحات بنر:</label>
                <textarea
                  rows={2}
                  value={formData.ordersNoticeText}
                  onChange={(e) => handleChange('ordersNoticeText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            تغییرات به محض ذخیره در کل سایت و هدر و فوتر اعمال می‌شوند.
          </span>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره کلیه تنظیمات</span>
          </button>
        </div>

      </form>

    </div>
  );
};
