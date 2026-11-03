export type CourseFormat = 'in_person' | 'semi_private' | 'online' | 'workshop';
export type CourseStatus = 'registering' | 'ongoing' | 'full' | 'upcoming';

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number; // in Tomans
  discountPrice?: number;
  capacity: number;
  enrolledCount: number;
  format: CourseFormat;
  formatLabel: string;
  duration: string;
  sessionsCount: number;
  certificate: string;
  instructor: string;
  instructorRole: string;
  syllabusItems: string[];
  prerequisites: string;
  level: string;
  startDate: string;
  schedule: string;
  image: string;
  status: CourseStatus;
  description: string;
  materialsProvided: boolean;
}

export type PaymentStatus = 'paid' | 'partial' | 'pending';
export type StudentStatus = 'active' | 'graduated' | 'reserved';

export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  tuitionTotal: number;
  tuitionPaid: number;
  paymentStatus: PaymentStatus;
  certificateIssued: boolean;
  status: StudentStatus;
  notes?: string;
}

export interface Student {
  id: string;
  fullName: string;
  nationalCode: string;
  phone: string;
  email?: string;
  enrollments: CourseEnrollment[];
  createdAt: string;
  notes?: string;

  // Legacy convenience fields for backwards compatibility
  courseId?: string;
  courseTitle?: string;
  registrationDate?: string;
  paymentStatus?: PaymentStatus;
  tuitionTotal?: number;
  tuitionPaid?: number;
  certificateIssued?: boolean;
  status?: StudentStatus;
}

export type ProductCategoryType = 'cakes' | 'desserts' | 'dry_pastries' | 'finger_foods';

export interface Product {
  id: string;
  title: string;
  category: ProductCategoryType;
  subcategory: string; // e.g. "تولد", "عروسی و نامزدی", "دورهمی", "پسرانه", "دخترانه", "مدرن"
  price: number; // price in Tomans (either flat or per kg)
  isPerKg: boolean;
  minWeightKg?: number;
  image: string;
  description: string;
  ingredients: string[];
  leadTimeDays: number; // days needed before delivery
  inStock: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  id: string; // unique item id in cart
  productId: string;
  product: Product;
  quantity: number;
  weightKg?: number;
  selectedFilling?: string;
  cakeText?: string;
  specialNotes?: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'courses' | 'orders' | 'certificates' | 'payments';
  order: number;
}

export interface SiteSettings {
  // Brand & Header
  brandName: string;
  brandSubtitle: string;
  logoImageUrl?: string;
  
  // Hero section
  heroBadge: string;
  heroHeadline: string;
  heroDescription: string;
  heroImageUrl: string;
  
  // Key Statistics
  statGraduatesCount: string;
  statGraduatesTitle: string;
  statGraduatesDesc: string;
  statCertificateTitle: string;
  statCertificateSub: string;
  statCertificateDesc: string;
  statPracticalTitle: string;
  statPracticalSub: string;
  statPracticalDesc: string;
  statSupportTitle: string;
  statSupportSub: string;
  statSupportDesc: string;
  
  // Contact & Location
  phone: string;
  mobile: string;
  address: string;
  workingHours: string;
  licenseNumber: string;
  footerBio: string;
  
  // Social & Online (Dynamic)
  instagramHandle: string;
  instagramUrl: string;
  whatsappNumber: string;
  socialLinks: SocialLink[];
  
  // Studio Custom Cake Notice
  ordersNoticeTitle: string;
  ordersNoticeText: string;
}

export type SocialPlatform =
  | 'instagram'
  | 'telegram'
  | 'whatsapp'
  | 'eitaa'
  | 'bale'
  | 'rubika'
  | 'youtube'
  | 'aparat'
  | 'linkedin'
  | 'pinterest'
  | 'website'
  | 'other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  handle?: string;
  isActive: boolean;
}
