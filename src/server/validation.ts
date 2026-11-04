export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function ensure(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new HttpError(status, message);
}
export function object(value: any) {
  ensure(value && typeof value === 'object' && !Array.isArray(value), 'ساختار اطلاعات نامعتبر است.');
  return value;
}
export function text(value: unknown, label: string, required = true, max = 2000): string {
  if (value == null && !required) return '';
  ensure(typeof value === 'string', `${label} نامعتبر است.`);
  const result = value.trim();
  ensure((!required || result.length > 0) && result.length <= max, `${label} نامعتبر است.`);
  return result;
}
export function number(value: unknown, label: string, min = 0, max = 1e12): number {
  ensure(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max, `${label} نامعتبر است.`);
  return value;
}
export function integer(value: unknown, label: string, min = 0, max = 100000) {
  const result = number(value, label, min, max);
  ensure(Number.isInteger(result), `${label} باید عدد صحیح باشد.`);
  return result;
}
export function choice(value: any, options: string[], label: string) {
  ensure(options.includes(value), `${label} نامعتبر است.`);
  return value;
}
export function boolean(value: unknown, fallback = false) {
  if (value === undefined) return fallback;
  ensure(typeof value === 'boolean', 'مقدار منطقی نامعتبر است.');
  return value;
}
export const digits = (value: string) => value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
export function phone(value: any) {
  let result = digits(text(value, 'شماره همراه', true, 30)).replace(/[\s()-]/g, '');
  result = result.replace(/^(\+98|0098)/, '0');
  ensure(/^09\d{9}$/.test(result), 'شماره همراه باید ۱۱ رقم و با ۰۹ آغاز شود.');
  return result;
}
export function url(value: any, image = false) {
  const result = text(value, 'آدرس', false);
  if (!result) return result;
  ensure((image && /^\/(?!\/)/.test(result)) || /^https?:\/\//i.test(result), 'آدرس باید با http یا https شروع شود.');
  return result;
}
export function strings(value: any, label: string) {
  ensure(Array.isArray(value) && value.length <= 200, `${label} نامعتبر است.`);
  return value.map(v => text(v, label));
}
export function course(input: any) {
  const c = object(input);
  const result: any = {};
  for (const key of ['title', 'slug', 'category', 'formatLabel', 'duration', 'certificate', 'instructor', 'instructorRole', 'prerequisites', 'level', 'startDate', 'schedule', 'description']) result[key] = text(c[key], key, key === 'title', key === 'description' ? 10000 : 2000);
  result.slug ||= `course-${crypto.randomUUID()}`;
  result.price = number(c.price, 'قیمت');
  result.discountPrice = c.discountPrice == null || c.discountPrice === '' ? null : number(c.discountPrice, 'قیمت تخفیف', 0, result.price);
  result.capacity = integer(c.capacity, 'ظرفیت', 1);
  result.enrolledCount = integer(c.enrolledCount ?? 0, 'ثبت‌نام‌شده');
  ensure(result.capacity >= result.enrolledCount, 'ظرفیت از تعداد ثبت‌نام کمتر است.');
  result.sessionsCount = integer(c.sessionsCount ?? 1, 'جلسات', 1);
  result.format = choice(c.format, ['in_person', 'semi_private', 'online', 'workshop'], 'نوع دوره');
  result.status = choice(c.status, ['registering', 'ongoing', 'full', 'upcoming'], 'وضعیت دوره');
  result.image = url(c.image, true);
  result.syllabusItems = strings(c.syllabusItems ?? [], 'سرفصل‌ها');
  result.materialsProvided = boolean(c.materialsProvided, true);
  return result;
}
export function product(input: any) {
  const p = object(input);
  return {
    title: text(p.title, 'نام محصول'), category: choice(p.category, ['cakes', 'desserts', 'dry_pastries', 'finger_foods'], 'دسته محصول'),
    subcategory: text(p.subcategory, 'زیردسته', false), price: number(p.price, 'قیمت'),
    isPerKg: boolean(p.isPerKg), minWeightKg: number(p.minWeightKg ?? 1, 'حداقل وزن', 0.1, 1000),
    image: url(p.image, true), description: text(p.description, 'توضیحات', false, 10000),
    ingredients: strings(p.ingredients ?? [], 'مواد اولیه'), leadTimeDays: integer(p.leadTimeDays ?? 0, 'زمان آماده‌سازی'),
    inStock: boolean(p.inStock, true), isPopular: boolean(p.isPopular),
  };
}
export function faq(input: any) {
  const f = object(input);
  return { question: text(f.question, 'پرسش'), answer: text(f.answer, 'پاسخ', true, 10000), category: choice(f.category, ['courses', 'orders', 'certificates', 'payments'], 'دسته سوال'), order: integer(f.order ?? 0, 'ترتیب') };
}
export function student(input: any) {
  const s = object(input);
  return { fullName: text(s.fullName, 'نام', true, 150), phone: phone(s.phone), nationalCode: digits(text(s.nationalCode, 'کد ملی', false, 20)), email: text(s.email, 'ایمیل', false, 150), notes: text(s.notes, 'یادداشت', false, 10000) };
}
export function enrollment(input: any) {
  const e = object(input);
  const total = number(e.tuitionTotal, 'شهریه');
  const paid = number(e.tuitionPaid ?? 0, 'پرداختی', 0, total);
  return { tuitionTotal: total, tuitionPaid: paid, paymentStatus: paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending', certificateIssued: boolean(e.certificateIssued), status: choice(e.status ?? 'active', ['active', 'graduated', 'reserved'], 'وضعیت هنرجو'), notes: text(e.notes, 'یادداشت', false, 10000) };
}
export function settings(input: any, defaults: any) {
  const s = object(input);
  const result: any = {};
  for (const key of Object.keys(defaults)) {
    if (key === 'socialLinks') continue;
    result[key] = text(s[key] ?? defaults[key], key, false, 10000);
    if (/Url$/.test(key)) result[key] = url(result[key], /Image/.test(key));
  }
  ensure(Array.isArray(s.socialLinks) && s.socialLinks.length <= 100, 'شبکه‌های اجتماعی نامعتبر است.');
  result.socialLinks = s.socialLinks.map((link: any) => ({ id: text(link.id, 'شناسه'), platform: choice(link.platform, ['instagram','telegram','whatsapp','eitaa','bale','rubika','youtube','aparat','linkedin','pinterest','website','other'], 'شبکه اجتماعی'), title: text(link.title, 'عنوان'), url: url(link.url), handle: text(link.handle, 'شناسه شبکه', false), isActive: boolean(link.isActive, true) }));
  return result;
}
