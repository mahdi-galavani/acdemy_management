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

export interface Student {
  id: string;
  fullName: string;
  nationalCode: string;
  phone: string;
  email?: string;
  courseId: string;
  courseTitle: string;
  registrationDate: string;
  paymentStatus: PaymentStatus;
  tuitionTotal: number;
  tuitionPaid: number;
  certificateIssued: boolean;
  status: StudentStatus;
  notes?: string;
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
