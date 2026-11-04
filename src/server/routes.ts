import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { requireAuth, AuthenticatedRequest, generateToken, comparePassword } from './auth';
import { getPool, usesPostgres } from './db';
import { config } from './config';
import { Repository, Table, withRepository, studentsWithEnrollments } from './repository';
import * as v from './validation';
import { INITIAL_COURSES, INITIAL_PRODUCTS, INITIAL_STUDENTS, INITIAL_ORDERS, INITIAL_FAQS, INITIAL_SITE_SETTINGS } from '../data/initialData';

export const apiRouter = Router();
const route = (fn: (req: AuthenticatedRequest, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { Promise.resolve(fn(req, res)).catch(next); };
const id = () => randomUUID();
const found = (value: any) => { v.ensure(value, 'رکورد پیدا نشد.', 404); return value; };
const publicLimit = (max: number) => {
  const windows = new Map<string, { count: number; until: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    for (const [key, value] of windows) if (value.until < now) windows.delete(key);
    const key = req.ip || 'unknown';
    const entry = windows.get(key) || { count: 0, until: now + 60000 };
    entry.count++; windows.set(key, entry);
    if (entry.count > max) { res.status(429).json({ success: false, error: 'درخواست‌های زیادی ارسال شده است. یک دقیقه بعد تلاش کنید.' }); return; }
    next();
  };
};

apiRouter.get('/health', route(async (_req, res) => {
  let connected = false;
  if (usesPostgres()) { try { await getPool()!.query('SELECT 1'); connected = true; } catch {} }
  res.status(usesPostgres() && !connected ? 503 : 200).json({ status: usesPostgres() && !connected ? 'unavailable' : 'ok', database: { connected, type: usesPostgres() ? 'postgresql' : 'in_memory_fallback', persistent: usesPostgres() }, environment: config.nodeEnv });
}));
apiRouter.post('/auth/login', publicLimit(10), route(async (req, res) => {
  const username = v.text(req.body.username, 'نام کاربری', true, 100);
  const password = v.text(req.body.password, 'رمز عبور', true, 200);
  const admin = await withRepository(false, async repo => (await repo.list('admins')).find(a => a.username === username));
  v.ensure(admin && await comparePassword(password, admin.password_hash), 'نام کاربری یا رمز عبور اشتباه است.', 401);
  const payload = { id: admin.id, username: admin.username, role: admin.role };
  res.json({ success: true, token: generateToken(payload), admin: payload });
}));
apiRouter.get('/auth/me', requireAuth, route(async (req, res) => {
  const admin = await withRepository(false, repo => repo.get('admins', req.admin!.id));
  v.ensure(admin && admin.username === req.admin!.username, 'حساب مدیر معتبر نیست.', 401);
  res.json({ success: true, admin: { id: admin.id, username: admin.username, role: admin.role } });
}));

async function settings(repo: Repository) { return (await repo.get('site_settings', 'main'))?.data || INITIAL_SITE_SETTINGS; }
apiRouter.get('/bootstrap', route(async (_req, res) => {
  const data = await withRepository(false, async repo => ({ courses: await repo.list('courses'), products: await repo.list('products'), faqs: await repo.list('faqs'), siteSettings: await settings(repo) }));
  res.json({ success: true, ...data });
}));
apiRouter.get('/admin/data', requireAuth, route(async (_req, res) => {
  const data = await withRepository(false, async repo => ({ students: await studentsWithEnrollments(repo), orders: await repo.list('orders') }));
  res.json({ success: true, ...data });
}));
apiRouter.get('/settings', route(async (_req, res) => res.json({ success: true, settings: await withRepository(false, settings) })));
apiRouter.put('/settings', requireAuth, route(async (req, res) => {
  const data = await withRepository(true, async repo => {
    const result = v.settings({ ...await settings(repo), ...v.object(req.body) }, INITIAL_SITE_SETTINGS);
    await repo.save('site_settings', { id: 'main', data: result }); return result;
  });
  res.json({ success: true, settings: data });
}));

for (const [table, singular, validate] of [ ['courses', 'course', v.course], ['products', 'product', v.product], ['faqs', 'faq', v.faq] ] as const) {
  apiRouter.get(`/${table}`, route(async (_req, res) => res.json({ success: true, [table]: await withRepository(false, repo => repo.list(table)) })));
  apiRouter.post(`/${table}`, requireAuth, route(async (req, res) => {
    const record = await withRepository(true, async repo => {
      const data = { ...validate(req.body), id: id() };
      if (table === 'courses') { data.enrolledCount = 0; await uniqueSlug(repo, data); }
      return repo.save(table, data);
    });
    res.status(201).json({ success: true, [singular]: record });
  }));
  apiRouter.put(`/${table}/:id`, requireAuth, route(async (req, res) => {
    const record = await withRepository(true, async repo => {
      const old = found(await repo.get(table, req.params.id));
      const data = { ...validate({ ...old, ...v.object(req.body), ...(table === 'courses' ? { enrolledCount: old.enrolledCount } : {}) }), id: old.id };
      if (table === 'courses') { await uniqueSlug(repo, data); if (data.enrolledCount >= data.capacity) data.status = 'full'; }
      return repo.save(table, data);
    });
    res.json({ success: true, [singular]: record });
  }));
  apiRouter.delete(`/${table}/:id`, requireAuth, route(async (req, res) => {
    await withRepository(true, async repo => {
      found(await repo.get(table, req.params.id));
      if (table === 'courses') for (const e of await repo.list('course_enrollments')) if (e.courseId === req.params.id) await repo.save('course_enrollments', { ...e, courseId: null });
      await repo.remove(table, req.params.id);
    });
    res.json({ success: true });
  }));
}
async function uniqueSlug(repo: Repository, course: any) { v.ensure(!(await repo.list('courses')).some(c => c.slug === course.slug && c.id !== course.id), 'نشانی دوره تکراری است.', 409); }
async function adjustCapacity(repo: Repository, courseId: string, delta: number) {
  const course = await repo.get('courses', courseId);
  if (!course) return;
  course.enrolledCount = Math.max(0, course.enrolledCount + delta);
  if (course.enrolledCount >= course.capacity) course.status = 'full';
  else if (course.status === 'full') course.status = 'registering';
  await repo.save('courses', course);
}
async function enroll(repo: Repository, studentId: string, input: any, isPublic: boolean) {
  const course = found(await repo.get('courses', v.text(input.courseId, 'دوره')));
  v.ensure(course.enrolledCount < course.capacity && course.status !== 'full', 'ظرفیت این دوره تکمیل است.', 409);
  if (isPublic) v.ensure(course.status === 'registering', 'ثبت‌نام این دوره باز نیست.', 409);
  const all = await repo.list('course_enrollments');
  v.ensure(!all.some(e => e.studentId === studentId && e.courseId === course.id), 'هنرجو قبلاً در این دوره ثبت‌نام شده است.', 409);
  const details = v.enrollment(isPublic ? { tuitionTotal: course.discountPrice ?? course.price, tuitionPaid: 0, status: 'reserved', notes: input.notes } : input);
  const enrollment = { ...details, id: id(), studentId, courseId: course.id, courseTitle: course.title, enrolledAt: new Date().toISOString() };
  await repo.save('course_enrollments', enrollment);
  await adjustCapacity(repo, course.id, 1);
  return enrollment;
}
async function register(repo: Repository, input: any, isPublic: boolean) {
  const details = v.student(input);
  let student = (await repo.list('students')).find(s => s.phone === details.phone);
  if (!student) { student = { ...details, id: id(), createdAt: new Date().toISOString() }; await repo.save('students', student); }
  // Public registration cannot overwrite the identity/financial history of an existing student.
  const enrollment = await enroll(repo, student.id, input, isPublic);
  return { student, enrollment };
}
apiRouter.post('/registrations', publicLimit(15), route(async (req, res) => {
  await withRepository(true, repo => register(repo, req.body, true));
  res.status(201).json({ success: true, message: 'پیش‌ثبت‌نام ذخیره شد.' });
}));
apiRouter.get('/students', requireAuth, route(async (_req, res) => res.json({ success: true, students: await withRepository(false, studentsWithEnrollments) })));
apiRouter.post('/students', requireAuth, route(async (req, res) => {
  const data = await withRepository(true, repo => register(repo, req.body, false));
  res.status(201).json({ success: true, ...data });
}));
apiRouter.put('/students/:id', requireAuth, route(async (req, res) => {
  const student = await withRepository(true, async repo => {
    const old = found(await repo.get('students', req.params.id));
    const data = { ...old, ...v.student({ ...old, ...v.object(req.body) }) };
    v.ensure(!(await repo.list('students')).some(s => s.phone === data.phone && s.id !== data.id), 'این شماره همراه برای هنرجوی دیگری ثبت شده است.', 409);
    return repo.save('students', data);
  });
  res.json({ success: true, student });
}));
apiRouter.post('/students/:id/enroll', requireAuth, route(async (req, res) => {
  const enrollment = await withRepository(true, async repo => { found(await repo.get('students', req.params.id)); return enroll(repo, req.params.id, req.body, false); });
  res.status(201).json({ success: true, enrollment });
}));
apiRouter.put('/students/:id/enrollments/:enrollmentId', requireAuth, route(async (req, res) => {
  const enrollment = await withRepository(true, async repo => {
    const old = found(await repo.get('course_enrollments', req.params.enrollmentId));
    v.ensure(old.studentId === req.params.id, 'ثبت‌نام پیدا نشد.', 404);
    return repo.save('course_enrollments', { ...old, ...v.enrollment({ ...old, ...v.object(req.body) }) });
  });
  res.json({ success: true, enrollment });
}));
apiRouter.delete('/students/:id/enrollments/:enrollmentId', requireAuth, route(async (req, res) => {
  await withRepository(true, async repo => {
    const old = found(await repo.get('course_enrollments', req.params.enrollmentId));
    v.ensure(old.studentId === req.params.id, 'ثبت‌نام پیدا نشد.', 404);
    await repo.remove('course_enrollments', old.id);
    if (old.courseId) await adjustCapacity(repo, old.courseId, -1);
  });
  res.json({ success: true });
}));
apiRouter.delete('/students/:id', requireAuth, route(async (req, res) => {
  await withRepository(true, async repo => {
    found(await repo.get('students', req.params.id));
    for (const e of await repo.list('course_enrollments')) if (e.studentId === req.params.id) { await repo.remove('course_enrollments', e.id); if (e.courseId) await adjustCapacity(repo, e.courseId, -1); }
    await repo.remove('students', req.params.id);
  });
  res.json({ success: true });
}));

apiRouter.get('/orders', requireAuth, route(async (_req, res) => res.json({ success: true, orders: await withRepository(false, repo => repo.list('orders')) })));
apiRouter.post('/orders', publicLimit(15), route(async (req, res) => {
  const order = await withRepository(true, async repo => {
    const data = v.object(req.body);
    const customerName = v.text(data.customerName, 'نام', true, 150);
    const customerPhone = v.phone(data.customerPhone);
    const deliveryAddress = v.text(data.deliveryAddress, 'نشانی');
    const deliveryDate = v.text(data.deliveryDate, 'تاریخ تحویل', true, 50);
    v.ensure(Array.isArray(data.items) && data.items.length > 0 && data.items.length <= 100, 'سبد سفارش خالی یا نامعتبر است.');
    const items = [];
    for (const raw of data.items) {
      v.object(raw);
      const product = found(await repo.get('products', v.text(raw.productId, 'محصول')));
      v.ensure(product.inStock, 'محصول انتخاب‌شده موجود نیست.', 409);
      const quantity = v.integer(raw.quantity, 'تعداد', 1, 100);
      const weightKg = product.isPerKg ? v.number(raw.weightKg, 'وزن', product.minWeightKg || 1, 1000) : 1;
      items.push({ id: id(), productId: product.id, product, quantity, weightKg, selectedFilling: v.text(raw.selectedFilling, 'فیلینگ', false), cakeText: v.text(raw.cakeText, 'متن کیک', false), specialNotes: v.text(raw.specialNotes, 'یادداشت', false), unitPrice: product.price, totalPrice: Math.round(product.price * weightKg * quantity) });
    }
    const result = { id: id(), orderNumber: `FND-${randomUUID().replaceAll('-', '').toUpperCase()}`, customerName, customerPhone, deliveryAddress, deliveryDate, items, totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0), status: 'pending', notes: v.text(data.notes, 'یادداشت', false), createdAt: new Date().toISOString() };
    await repo.save('orders', result); return result;
  });
  res.status(201).json({ success: true, order, orderNumber: order.orderNumber });
}));
apiRouter.patch('/orders/:id/status', requireAuth, route(async (req, res) => {
  const order = await withRepository(true, async repo => {
    const old = found(await repo.get('orders', req.params.id));
    return repo.save('orders', { ...old, status: v.choice(req.body.status, ['pending', 'in_progress', 'ready', 'delivered', 'cancelled'], 'وضعیت سفارش') });
  });
  res.json({ success: true, order });
}));
apiRouter.delete('/orders/:id', requireAuth, route(async (req, res) => { await withRepository(true, async repo => { found(await repo.get('orders', req.params.id)); await repo.remove('orders', req.params.id); }); res.json({ success: true }); }));

// Exact phone + identity/tracking proof; never expose all records to the public SPA.
apiRouter.post('/inquiry', publicLimit(10), route(async (req, res) => {
  const phone = v.phone(req.body.phone);
  const proof = v.digits(v.text(req.body.proof, 'کد ملی یا کد رهگیری')).toUpperCase();
  const result = await withRepository(false, async repo => {
    const student = (await studentsWithEnrollments(repo)).find(s => s.phone === phone && /^\d{10}$/.test(proof) && s.nationalCode === proof);
    const orders = (await repo.list('orders')).filter(o => o.customerPhone === phone && o.orderNumber.toUpperCase() === proof).map(o => ({ id: o.id, orderNumber: o.orderNumber, customerName: o.customerName, status: o.status, deliveryDate: o.deliveryDate, createdAt: o.createdAt, totalAmount: o.totalAmount, items: o.items }));
    return { student: student ? { id: student.id, fullName: student.fullName, enrollments: student.enrollments } : null, orders };
  });
  res.json({ success: true, ...result });
}));

async function backup(repo: Repository) {
  return { version: 1, exportedAt: new Date().toISOString(), courses: await repo.list('courses'), products: await repo.list('products'), students: await studentsWithEnrollments(repo), orders: await repo.list('orders'), faqs: await repo.list('faqs'), siteSettings: await settings(repo) };
}
function validId(value: any) { return v.text(value, 'شناسه', true, 64); }
function date(value: any) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : new Date().toISOString(); }
async function restore(repo: Repository, input: any) {
  const data = v.object(input);
  for (const key of ['courses','products','students','orders','faqs']) v.ensure(Array.isArray(data[key]) && data[key].length <= 50000, `بخش ${key} در فایل پشتیبان نامعتبر است.`);
  const records: Record<string, any[]> = { courses: [], products: [], students: [], course_enrollments: [], orders: [], faqs: [] };
  for (const [table, validator] of [['courses',v.course],['products',v.product],['faqs',v.faq]] as const) records[table] = data[table].map((r: any) => ({ ...validator(r), id: validId(r.id) }));
  const courseIds = new Set(records.courses.map(c => c.id));
  for (const raw of data.students) {
    const student = { ...v.student(raw), id: validId(raw.id), createdAt: date(raw.createdAt) };
    v.ensure(Array.isArray(raw.enrollments), 'ثبت‌نام‌های هنرجو نامعتبر است.');
    records.students.push(student);
    for (const e of raw.enrollments) {
      v.ensure(!e.courseId || courseIds.has(e.courseId), 'دوره ثبت‌نام در فایل پشتیبان وجود ندارد.');
      records.course_enrollments.push({ ...v.enrollment(e), id: validId(e.id), studentId: student.id, courseId: e.courseId || null, courseTitle: v.text(e.courseTitle, 'نام دوره'), enrolledAt: v.text(e.enrolledAt, 'تاریخ ثبت‌نام') });
    }
  }
  for (const raw of data.orders) {
    v.ensure(Array.isArray(raw.items), 'اقلام سفارش نامعتبر است.');
    const items = raw.items.map((item: any) => ({ id: validId(item.id), productId: validId(item.productId), product: { ...v.product(item.product), id: validId(item.product.id) }, quantity: v.integer(item.quantity,'تعداد',1), weightKg: v.number(item.weightKg ?? 1,'وزن',0.1), unitPrice: v.number(item.unitPrice,'قیمت'), totalPrice: v.number(item.totalPrice,'مبلغ'), selectedFilling: v.text(item.selectedFilling,'فیلینگ',false), cakeText: v.text(item.cakeText,'متن',false), specialNotes: v.text(item.specialNotes,'یادداشت',false) }));
    records.orders.push({ id: validId(raw.id), orderNumber: v.text(raw.orderNumber,'کد سفارش',true,50), customerName: v.text(raw.customerName,'نام'), customerPhone: v.phone(raw.customerPhone), deliveryAddress: v.text(raw.deliveryAddress,'آدرس',false), deliveryDate: v.text(raw.deliveryDate,'تاریخ',false), items, totalAmount: v.number(raw.totalAmount,'مبلغ'), status: v.choice(raw.status,['pending','in_progress','ready','delivered','cancelled'],'وضعیت'), notes: v.text(raw.notes,'یادداشت',false), createdAt: date(raw.createdAt) });
  }
  for (const rows of Object.values(records)) v.ensure(new Set(rows.map(r => r.id)).size === rows.length, 'شناسه تکراری در فایل پشتیبان وجود دارد.');
  for (const [table, field] of [['students','phone'],['courses','slug'],['orders','orderNumber']]) v.ensure(new Set(records[table].map(r=>r[field])).size === records[table].length, `مقدار تکراری ${field} در فایل پشتیبان.`);
  const enrollmentPairs = records.course_enrollments.filter(e=>e.courseId).map(e=>`${e.studentId}:${e.courseId}`);
  v.ensure(new Set(enrollmentPairs).size === enrollmentPairs.length, 'ثبت‌نام تکراری در فایل پشتیبان.');
  for (const c of records.courses) {
    c.enrolledCount = Math.max(c.enrolledCount, records.course_enrollments.filter(e=>e.courseId===c.id).length);
    v.ensure(c.enrolledCount <= c.capacity, 'ظرفیت دوره در پشتیبان نامعتبر است.');
    if (c.enrolledCount === c.capacity) c.status = 'full';
  }
  const siteSettings = v.settings(data.siteSettings, INITIAL_SITE_SETTINGS);
  // Validation completes before deletion; the entire restore is one transaction.
  for (const table of ['course_enrollments','students','orders','courses','products','faqs'] as Table[]) await repo.remove(table);
  for (const table of ['courses','products','students','course_enrollments','orders','faqs'] as Table[]) for (const row of records[table]) await repo.save(table,row);
  await repo.save('site_settings', { id: 'main', data: siteSettings });
}
apiRouter.get('/backup', requireAuth, route(async (_req,res)=>res.json({ success:true, backup:await withRepository(false,backup) })));
apiRouter.put('/backup', requireAuth, route(async (req,res)=>{ await withRepository(true,repo=>restore(repo,req.body)); res.json({success:true}); }));
apiRouter.post('/reset', requireAuth, route(async (_req,res)=>{
  await withRepository(true,repo=>restore(repo, { courses:INITIAL_COURSES,products:INITIAL_PRODUCTS,students:INITIAL_STUDENTS,orders:INITIAL_ORDERS,faqs:INITIAL_FAQS,siteSettings:INITIAL_SITE_SETTINGS }));
  res.json({success:true});
}));

apiRouter.use((_req,res)=>res.status(404).json({success:false,error:'مسیر API پیدا نشد.'}));
apiRouter.use((err:any,_req:Request,res:Response,_next:NextFunction)=>{
  if (err instanceof v.HttpError) { res.status(err.status).json({success:false,error:err.message}); return; }
  if (err.code === '23505') { res.status(409).json({success:false,error:'اطلاعات تکراری است.'}); return; }
  console.error('[API error]',err.message);
  res.status(503).json({success:false,error:'ذخیره یا دریافت اطلاعات انجام نشد. اتصال سرور و پایگاه داده را بررسی کنید.'});
});
