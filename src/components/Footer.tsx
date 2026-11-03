import React from 'react';
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Send,
  MessageSquare,
  MessageCircle,
  Video,
  Youtube,
  Radio,
  Linkedin,
  Bookmark,
  Share2,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SocialPlatform } from '../types';

const SocialPlatformIcon: React.FC<{ platform: SocialPlatform; className?: string }> = ({
  platform,
  className = 'w-4 h-4'
}) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'telegram':
      return <Send className={className} />;
    case 'eitaa':
      return <MessageCircle className={className} />;
    case 'bale':
      return <Radio className={className} />;
    case 'whatsapp':
      return <MessageSquare className={className} />;
    case 'rubika':
      return <Share2 className={className} />;
    case 'aparat':
      return <Video className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'pinterest':
      return <Bookmark className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    default:
      return <Globe className={className} />;
  }
};

export const Footer: React.FC = () => {
  const { setCurrentView, siteSettings } = useApp();

  const activeSocialLinks = (siteSettings.socialLinks || []).filter((s) => s.isActive);

  return (
    <footer id="contact" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              {siteSettings.logoImageUrl ? (
                <img
                  src={siteSettings.logoImageUrl}
                  alt={siteSettings.brandName}
                  className="w-9 h-9 rounded-xl object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center text-white">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
              )}
              <span className="font-extrabold text-lg text-white">{siteSettings.brandName}</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {siteSettings.footerBio}
            </p>
            <div className="text-xs text-amber-400 font-medium pt-1">
              {siteSettings.licenseNumber}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#courses" className="hover:text-amber-400 transition-colors">لیست دوره‌های آموزشی</a>
              </li>
              <li>
                <a href="#products" className="hover:text-amber-400 transition-colors">سفارش کیک‌های مجلسی</a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-amber-400 transition-colors">مرکز سوالات متداول</a>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="hover:text-amber-400 transition-colors text-right"
                >
                  ورود به پنل مدیریت (ادمین)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">اطلاعات تماس</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="tabular-nums">
                  {siteSettings.phone} {siteSettings.mobile ? `| ${siteSettings.mobile}` : ''}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{siteSettings.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Order Notes */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">آتلیه سفارشات اختصاصی</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              جهت سفارش کیک‌های خاص نامزدی، عروسی و رویدادهای شرکتی با طراحی اختصاصی، همه‌روزه می‌توانید جهت مشاوره حضوری و تست طعم فیلینگ به آتلیه {siteSettings.brandName} مراجعه فرمایید.
            </p>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 text-[11px] text-stone-300">
              ارسال امن با خودروهای مجهز به یخچال در سراسر تهران و حومه.
            </div>
          </div>

        </div>

        {/* Dynamic Social Networks Bar */}
        {activeSocialLinks.length > 0 && (
          <div className="py-6 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-300 font-bold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-500" />
              <span>فندق در شبکه‌های اجتماعی و پیام‌رسان‌ها:</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {activeSocialLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.handle ? `${item.title} (${item.handle})` : item.title}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-amber-800/90 border border-stone-700/70 hover:border-amber-700 text-stone-300 hover:text-white transition-all text-xs group"
                >
                  <SocialPlatformIcon platform={item.platform} className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" />
                  <span>{item.title}</span>
                  {item.handle && (
                    <span className="text-[10px] text-stone-500 group-hover:text-amber-200 ltr font-mono">
                      {item.handle}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© تمامی حقوق برای {siteSettings.brandName} محفوظ است.</p>
          <p className="text-[11px]">سامانه آموزشگاهی و سفارش آنلاین کیک و شیرینی</p>
        </div>

      </div>
    </footer>
  );
};
