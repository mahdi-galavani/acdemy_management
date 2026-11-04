import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest, generateToken, comparePassword } from './auth';
import { query, isDbConnected, inMemoryStore, initDatabase } from './db';
import { config } from './config';
import { Student, CourseEnrollment, Course, Product, Order, FAQItem, SiteSettings } from '../types';

export const apiRouter = Router();

// ==========================================
// 1. Health & Status Check
// ==========================================
apiRouter.get('/health', async (_req: Request, res: Response) => {
  const connected = isDbConnected();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    database: {
      type: connected ? 'postgresql' : 'in_memory_fallback',
      connected,
      host: config.database.host,
      database: config.database.name,
      port: config.database.port,
    },
    version: '1.0.0',
    app: 'Fandoq Academy & Confectionery Backend',
  });
});

// ==========================================
// 2. Authentication Routes
// ==========================================
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, error: 'نام کاربری و رمز عبور الزامی است.' });
      return;
    }

    let adminRecord: { id: string; username: string; password_hash: string; role: string } | null = null;

    if (isDbConnected()) {
      const result = await query(
        'SELECT id, username, password_hash, role FROM admins WHERE username = $1 LIMIT 1',
        [username]
      );
      if (result && result.rows.length > 0) {
        adminRecord = result.rows[0];
      }
    } else {
      adminRecord = inMemoryStore.admins.find((a) => a.username === username) || null;
    }

    if (!adminRecord) {
      res.status(401).json({ success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' });
      return;
    }

    const isMatch = await comparePassword(password, adminRecord.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' });
      return;
    }

    // Update last login if connected
    if (isDbConnected()) {
      await query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [adminRecord.id]);
    }

    const token = generateToken({
      id: adminRecord.id,
      username: adminRecord.username,
      role: adminRecord.role,
    });

    res.json({
      success: true,
      token,
      admin: {
        id: adminRecord.id,
        username: adminRecord.username,
        role: adminRecord.role,
      },
      message: 'ورود به سامانه با موفقیت انجام شد.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'خطای سرور در احراز هویت' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

// ==========================================
// 3. Site Settings Routes
// ==========================================
apiRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const result = await query("SELECT data FROM site_settings WHERE id = 'main'");
      if (result && result.rows.length > 0) {
        res.json({ success: true, settings: result.rows[0].data });
        return;
      }
    }
    res.json({ success: true, settings: inMemoryStore.siteSettings });
  } catch (err: any) {
    res.json({ success: true, settings: inMemoryStore.siteSettings });
  }
});

apiRouter.put('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedSettings = req.body;
    if (isDbConnected()) {
      await query(
        `INSERT INTO site_settings (id, data, updated_at)
         VALUES ('main', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(updatedSettings)]
      );
    }
    inMemoryStore.siteSettings = { ...inMemoryStore.siteSettings, ...updatedSettings };
    res.json({ success: true, settings: inMemoryStore.siteSettings, message: 'تنظیمات با موفقیت ذخیره شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. Courses Routes
// ==========================================
apiRouter.get('/courses', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const result = await query('SELECT * FROM courses ORDER BY created_at DESC');
      if (result) {
        const courses = result.rows.map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          category: row.category,
          price: Number(row.price),
          discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
          capacity: row.capacity,
          enrolledCount: row.enrolled_count,
          format: row.format,
          formatLabel: row.format_label,
          duration: row.duration,
          sessionsCount: row.sessions_count,
          certificate: row.certificate,
          instructor: row.instructor,
          instructorRole: row.instructor_role,
          syllabusItems: typeof row.syllabus_items === 'string' ? JSON.parse(row.syllabus_items) : (row.syllabus_items || []),
          prerequisites: row.prerequisites,
          level: row.level,
          startDate: row.start_date,
          schedule: row.schedule,
          image: row.image,
          status: row.status,
          description: row.description,
          materialsProvided: row.materials_provided,
        }));
        res.json({ success: true, courses });
        return;
      }
    }
    res.json({ success: true, courses: inMemoryStore.courses });
  } catch (err: any) {
    res.json({ success: true, courses: inMemoryStore.courses });
  }
});

apiRouter.post('/courses', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const c: Course = {
      ...req.body,
      id: req.body.id || `course-${Date.now()}`,
    };

    if (isDbConnected()) {
      await query(
        `INSERT INTO courses (
          id, title, slug, category, price, discount_price, capacity, enrolled_count,
          format, format_label, duration, sessions_count, certificate, instructor,
          instructor_role, syllabus_items, prerequisites, level, start_date, schedule,
          image, status, description, materials_provided
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          c.id, c.title, c.slug, c.category, c.price, c.discountPrice || null, c.capacity, c.enrolledCount || 0,
          c.format, c.formatLabel, c.duration, c.sessionsCount, c.certificate, c.instructor,
          c.instructorRole, JSON.stringify(c.syllabusItems || []), c.prerequisites, c.level, c.startDate, c.schedule,
          c.image, c.status, c.description, c.materialsProvided
        ]
      );
    }
    inMemoryStore.courses.unshift(c);
    res.json({ success: true, course: c });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/courses/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const c = req.body;
  try {
    if (isDbConnected()) {
      await query(
        `UPDATE courses SET
          title = COALESCE($1, title),
          category = COALESCE($2, category),
          price = COALESCE($3, price),
          discount_price = $4,
          capacity = COALESCE($5, capacity),
          enrolled_count = COALESCE($6, enrolled_count),
          format = COALESCE($7, format),
          format_label = COALESCE($8, format_label),
          duration = COALESCE($9, duration),
          sessions_count = COALESCE($10, sessions_count),
          certificate = COALESCE($11, certificate),
          instructor = COALESCE($12, instructor),
          instructor_role = COALESCE($13, instructor_role),
          syllabus_items = COALESCE($14, syllabus_items),
          prerequisites = COALESCE($15, prerequisites),
          level = COALESCE($16, level),
          start_date = COALESCE($17, start_date),
          schedule = COALESCE($18, schedule),
          image = COALESCE($19, image),
          status = COALESCE($20, status),
          description = COALESCE($21, description),
          materials_provided = COALESCE($22, materials_provided)
        WHERE id = $23`,
        [
          c.title, c.category, c.price, c.discountPrice || null, c.capacity, c.enrolledCount,
          c.format, c.formatLabel, c.duration, c.sessionsCount, c.certificate, c.instructor,
          c.instructorRole, c.syllabusItems ? JSON.stringify(c.syllabusItems) : null,
          c.prerequisites, c.level, c.startDate, c.schedule, c.image, c.status,
          c.description, c.materialsProvided, id
        ]
      );
    }
    const idx = inMemoryStore.courses.findIndex((item) => item.id === id);
    if (idx !== -1) {
      inMemoryStore.courses[idx] = { ...inMemoryStore.courses[idx], ...c };
    }
    res.json({ success: true, message: 'دوره با موفقیت به‌روزرسانی شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/courses/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      await query('DELETE FROM courses WHERE id = $1', [id]);
    }
    inMemoryStore.courses = inMemoryStore.courses.filter((c) => c.id !== id);
    res.json({ success: true, message: 'دوره با موفقیت حذف شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. Students & Enrollments Routes
// ==========================================
apiRouter.get('/students', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const studentsRes = await query('SELECT * FROM students ORDER BY created_at DESC');
      const enrollmentsRes = await query('SELECT * FROM course_enrollments');

      if (studentsRes && enrollmentsRes) {
        const enrollmentsMap: Record<string, CourseEnrollment[]> = {};
        for (const e of enrollmentsRes.rows) {
          if (!enrollmentsMap[e.student_id]) enrollmentsMap[e.student_id] = [];
          enrollmentsMap[e.student_id].push({
            id: e.id,
            courseId: e.course_id,
            courseTitle: e.course_title,
            enrolledAt: e.enrolled_at,
            tuitionTotal: Number(e.tuition_total),
            tuitionPaid: Number(e.tuition_paid),
            paymentStatus: e.payment_status,
            certificateIssued: e.certificate_issued,
            status: e.status,
            notes: e.notes,
          });
        }

        const students: Student[] = studentsRes.rows.map((s) => ({
          id: s.id,
          fullName: s.full_name,
          nationalCode: s.national_code,
          phone: s.phone,
          email: s.email,
          notes: s.notes,
          createdAt: s.created_at,
          enrollments: enrollmentsMap[s.id] || [],
        }));

        res.json({ success: true, students });
        return;
      }
    }
    res.json({ success: true, students: inMemoryStore.students });
  } catch (err: any) {
    res.json({ success: true, students: inMemoryStore.students });
  }
});

// Public Self-Registration for Landing Page visitors
apiRouter.post('/students/public-enroll', async (req: Request, res: Response) => {
  try {
    const studentData = req.body;
    if (!studentData.fullName || !studentData.phone || !studentData.courseId) {
      res.status(400).json({ success: false, error: 'نام، شماره همراه و مشخصات دوره الزامی است.' });
      return;
    }

    const cleanPhone = studentData.phone.replace(/[^0-9]/g, '');
    let existingStudent: Student | undefined;

    if (isDbConnected()) {
      const existingRes = await query('SELECT * FROM students WHERE phone LIKE $1 LIMIT 1', [`%${cleanPhone}%`]);
      if (existingRes && existingRes.rows.length > 0) {
        existingStudent = {
          id: existingRes.rows[0].id,
          fullName: existingRes.rows[0].full_name,
          nationalCode: existingRes.rows[0].national_code,
          phone: existingRes.rows[0].phone,
          email: existingRes.rows[0].email,
          notes: existingRes.rows[0].notes,
          createdAt: existingRes.rows[0].created_at,
          enrollments: [],
        };
      }
    } else {
      existingStudent = inMemoryStore.students.find((s) => s.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
    }

    const enrollmentId = `enr-${Date.now()}`;
    const newEnrollment: CourseEnrollment = {
      id: enrollmentId,
      courseId: studentData.courseId,
      courseTitle: studentData.courseTitle || 'دوره آموزشی',
      enrolledAt: new Date().toLocaleDateString('fa-IR'),
      tuitionTotal: Number(studentData.tuitionTotal || 0),
      tuitionPaid: Number(studentData.tuitionPaid || 0),
      paymentStatus: studentData.paymentStatus || 'pending',
      certificateIssued: false,
      status: studentData.status || 'reserved',
      notes: studentData.notes || 'پیش‌ثبت‌نام آنلاین از وب‌سایت',
    };

    if (existingStudent) {
      // Add enrollment to existing student
      if (isDbConnected()) {
        await query(
          `INSERT INTO course_enrollments (
            id, student_id, course_id, course_title, enrolled_at, tuition_total, tuition_paid,
            payment_status, certificate_issued, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            newEnrollment.id, existingStudent.id, newEnrollment.courseId, newEnrollment.courseTitle,
            newEnrollment.enrolledAt, newEnrollment.tuitionTotal, newEnrollment.tuitionPaid,
            newEnrollment.paymentStatus, newEnrollment.certificateIssued, newEnrollment.status, newEnrollment.notes
          ]
        );
      }
      const memStudent = inMemoryStore.students.find((s) => s.id === existingStudent?.id);
      if (memStudent) {
        if (!memStudent.enrollments) memStudent.enrollments = [];
        memStudent.enrollments.push(newEnrollment);
      }
      res.json({ success: true, message: 'پیش‌ثبت‌نام دوره جدید به پرونده هنرجو اضافه شد.', studentId: existingStudent.id });
      return;
    }

    // Create brand new student + enrollment
    const studentId = `std-${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      fullName: studentData.fullName,
      phone: studentData.phone,
      nationalCode: studentData.nationalCode || 'ثبت نشده',
      email: studentData.email || '',
      notes: studentData.notes || 'ثبت‌نام آنلاین از وب‌سایت',
      createdAt: new Date().toISOString(),
      enrollments: [newEnrollment],
    };

    if (isDbConnected()) {
      await query(
        `INSERT INTO students (id, full_name, national_code, phone, email, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newStudent.id, newStudent.fullName, newStudent.nationalCode, newStudent.phone, newStudent.email, newStudent.notes, newStudent.createdAt]
      );
      await query(
        `INSERT INTO course_enrollments (
          id, student_id, course_id, course_title, enrolled_at, tuition_total, tuition_paid,
          payment_status, certificate_issued, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newEnrollment.id, newStudent.id, newEnrollment.courseId, newEnrollment.courseTitle,
          newEnrollment.enrolledAt, newEnrollment.tuitionTotal, newEnrollment.tuitionPaid,
          newEnrollment.paymentStatus, newEnrollment.certificateIssued, newEnrollment.status, newEnrollment.notes
        ]
      );
    }

    inMemoryStore.students.unshift(newStudent);
    res.json({ success: true, message: 'رزرو و پیش‌ثبت‌نام با موفقیت ثبت گردید.', student: newStudent });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/students', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentData = req.body;
    const studentId = `std-${Date.now()}`;
    const enrollmentId = `enr-${Date.now()}`;

    const newStudent: Student = {
      id: studentId,
      fullName: studentData.fullName,
      phone: studentData.phone,
      nationalCode: studentData.nationalCode || '',
      email: studentData.email || '',
      notes: studentData.notes || '',
      createdAt: new Date().toISOString(),
      enrollments: [
        {
          id: enrollmentId,
          courseId: studentData.courseId,
          courseTitle: studentData.courseTitle,
          enrolledAt: new Date().toLocaleDateString('fa-IR'),
          tuitionTotal: Number(studentData.tuitionTotal || 0),
          tuitionPaid: Number(studentData.tuitionPaid || 0),
          paymentStatus: studentData.paymentStatus || 'pending',
          certificateIssued: false,
          status: 'active',
          notes: studentData.notes,
        },
      ],
    };

    if (isDbConnected()) {
      await query(
        `INSERT INTO students (id, full_name, national_code, phone, email, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newStudent.id, newStudent.fullName, newStudent.nationalCode, newStudent.phone, newStudent.email, newStudent.notes, newStudent.createdAt]
      );

      const e = newStudent.enrollments[0];
      await query(
        `INSERT INTO course_enrollments (
          id, student_id, course_id, course_title, enrolled_at, tuition_total, tuition_paid,
          payment_status, certificate_issued, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [e.id, newStudent.id, e.courseId, e.courseTitle, e.enrolledAt, e.tuitionTotal, e.tuitionPaid, e.paymentStatus, e.certificateIssued, e.status, e.notes]
      );
    }

    inMemoryStore.students.unshift(newStudent);
    res.json({ success: true, student: newStudent });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/students/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const s = req.body;
  try {
    if (isDbConnected()) {
      await query(
        `UPDATE students SET
          full_name = COALESCE($1, full_name),
          national_code = COALESCE($2, national_code),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          notes = COALESCE($5, notes)
        WHERE id = $6`,
        [s.fullName, s.nationalCode, s.phone, s.email, s.notes, id]
      );
    }
    const idx = inMemoryStore.students.findIndex((item) => item.id === id);
    if (idx !== -1) {
      inMemoryStore.students[idx] = { ...inMemoryStore.students[idx], ...s };
    }
    res.json({ success: true, message: 'اطلاعات هنرجو به‌روزرسانی شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/students/:id/enroll', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.id;
    const data = req.body;
    const enrollmentId = `enr-${Date.now()}`;

    const newEnrollment: CourseEnrollment = {
      id: enrollmentId,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      enrolledAt: new Date().toLocaleDateString('fa-IR'),
      tuitionTotal: Number(data.tuitionTotal || 0),
      tuitionPaid: Number(data.tuitionPaid || 0),
      paymentStatus: data.paymentStatus || 'pending',
      certificateIssued: false,
      status: 'active',
      notes: data.notes,
    };

    if (isDbConnected()) {
      await query(
        `INSERT INTO course_enrollments (
          id, student_id, course_id, course_title, enrolled_at, tuition_total, tuition_paid,
          payment_status, certificate_issued, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newEnrollment.id, studentId, newEnrollment.courseId, newEnrollment.courseTitle,
          newEnrollment.enrolledAt, newEnrollment.tuitionTotal, newEnrollment.tuitionPaid,
          newEnrollment.paymentStatus, newEnrollment.certificateIssued, newEnrollment.status, newEnrollment.notes
        ]
      );
    }

    const st = inMemoryStore.students.find((s) => s.id === studentId);
    if (st) {
      if (!st.enrollments) st.enrollments = [];
      st.enrollments.push(newEnrollment);
    }

    res.json({ success: true, enrollment: newEnrollment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/students/:studentId/enrollments/:enrollmentId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { studentId, enrollmentId } = req.params;
  const fields = req.body;
  try {
    if (isDbConnected()) {
      await query(
        `UPDATE course_enrollments SET
          tuition_paid = COALESCE($1, tuition_paid),
          payment_status = COALESCE($2, payment_status),
          certificate_issued = COALESCE($3, certificate_issued),
          status = COALESCE($4, status),
          notes = COALESCE($5, notes)
        WHERE id = $6 AND student_id = $7`,
        [fields.tuitionPaid, fields.paymentStatus, fields.certificateIssued, fields.status, fields.notes, enrollmentId, studentId]
      );
    }

    const st = inMemoryStore.students.find((s) => s.id === studentId);
    if (st && st.enrollments) {
      const eIdx = st.enrollments.findIndex((e) => e.id === enrollmentId);
      if (eIdx !== -1) {
        st.enrollments[eIdx] = { ...st.enrollments[eIdx], ...fields };
      }
    }
    res.json({ success: true, message: 'دوره هنرجو با موفقیت ویرایش شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/students/:studentId/enrollments/:enrollmentId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { studentId, enrollmentId } = req.params;
  try {
    if (isDbConnected()) {
      await query('DELETE FROM course_enrollments WHERE id = $1 AND student_id = $2', [enrollmentId, studentId]);
    }
    const st = inMemoryStore.students.find((s) => s.id === studentId);
    if (st && st.enrollments) {
      st.enrollments = st.enrollments.filter((e) => e.id !== enrollmentId);
    }
    res.json({ success: true, message: 'دوره از سوابق هنرجو حذف شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/students/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await query('DELETE FROM students WHERE id = $1', [id]);
    }
    inMemoryStore.students = inMemoryStore.students.filter((s) => s.id !== id);
    res.json({ success: true, message: 'هنرجو با موفقیت حذف گردید.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. Products & Orders Routes
// ==========================================
apiRouter.get('/products', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const result = await query('SELECT * FROM products ORDER BY created_at DESC');
      if (result) {
        const products = result.rows.map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          subcategory: row.subcategory,
          price: Number(row.price),
          isPerKg: row.is_per_kg,
          minWeightKg: row.min_weight_kg ? Number(row.min_weight_kg) : undefined,
          image: row.image,
          description: row.description,
          ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : (row.ingredients || []),
          leadTimeDays: row.lead_time_days,
          inStock: row.in_stock,
          isPopular: row.is_popular,
        }));
        res.json({ success: true, products });
        return;
      }
    }
    res.json({ success: true, products: inMemoryStore.products });
  } catch (err: any) {
    res.json({ success: true, products: inMemoryStore.products });
  }
});

apiRouter.post('/products', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const p: Product = {
      ...req.body,
      id: req.body.id || `prod-${Date.now()}`,
    };

    if (isDbConnected()) {
      await query(
        `INSERT INTO products (
          id, title, category, subcategory, price, is_per_kg, min_weight_kg,
          image, description, ingredients, lead_time_days, in_stock, is_popular
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          p.id, p.title, p.category, p.subcategory, p.price, p.isPerKg, p.minWeightKg || null,
          p.image, p.description, JSON.stringify(p.ingredients || []), p.leadTimeDays, p.inStock, p.isPopular || false
        ]
      );
    }
    inMemoryStore.products.unshift(p);
    res.json({ success: true, product: p });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/products/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const p = req.body;
  try {
    if (isDbConnected()) {
      await query(
        `UPDATE products SET
          title = COALESCE($1, title),
          category = COALESCE($2, category),
          subcategory = COALESCE($3, subcategory),
          price = COALESCE($4, price),
          is_per_kg = COALESCE($5, is_per_kg),
          min_weight_kg = $6,
          image = COALESCE($7, image),
          description = COALESCE($8, description),
          ingredients = COALESCE($9, ingredients),
          lead_time_days = COALESCE($10, lead_time_days),
          in_stock = COALESCE($11, in_stock),
          is_popular = COALESCE($12, is_popular)
        WHERE id = $13`,
        [
          p.title, p.category, p.subcategory, p.price, p.isPerKg, p.minWeightKg || null,
          p.image, p.description, p.ingredients ? JSON.stringify(p.ingredients) : null,
          p.leadTimeDays, p.inStock, p.isPopular, id
        ]
      );
    }
    const idx = inMemoryStore.products.findIndex((item) => item.id === id);
    if (idx !== -1) {
      inMemoryStore.products[idx] = { ...inMemoryStore.products[idx], ...p };
    }
    res.json({ success: true, message: 'محصول با موفقیت ویرایش شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/products/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      await query('DELETE FROM products WHERE id = $1', [id]);
    }
    inMemoryStore.products = inMemoryStore.products.filter((p) => p.id !== id);
    res.json({ success: true, message: 'محصول حذف شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/orders', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
      if (result) {
        const orders = result.rows.map((row) => ({
          id: row.id,
          orderNumber: row.order_number,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          deliveryDate: row.delivery_date,
          deliveryAddress: row.delivery_address,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
          totalAmount: Number(row.total_amount),
          status: row.status,
          notes: row.notes,
          createdAt: row.created_at,
        }));
        res.json({ success: true, orders });
        return;
      }
    }
    res.json({ success: true, orders: inMemoryStore.orders });
  } catch (err: any) {
    res.json({ success: true, orders: inMemoryStore.orders });
  }
});

// Public checkout order endpoint
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const orderNumber = `FND-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryDate: orderData.deliveryDate,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items || [],
      totalAmount: Number(orderData.totalAmount || 0),
      status: 'pending',
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      await query(
        `INSERT INTO orders (
          id, order_number, customer_name, customer_phone, delivery_date, delivery_address,
          items, total_amount, status, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newOrder.id, newOrder.orderNumber, newOrder.customerName, newOrder.customerPhone,
          newOrder.deliveryDate, newOrder.deliveryAddress, JSON.stringify(newOrder.items),
          newOrder.totalAmount, newOrder.status, newOrder.notes, newOrder.createdAt
        ]
      );
    }
    inMemoryStore.orders.unshift(newOrder);
    res.json({ success: true, order: newOrder, orderNumber });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/orders/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (isDbConnected()) {
      await query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    }
    const o = inMemoryStore.orders.find((item) => item.id === id);
    if (o) {
      o.status = status;
    }
    res.json({ success: true, message: 'وضعیت سفارش به‌روزرسانی شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/orders/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      await query('DELETE FROM orders WHERE id = $1', [id]);
    }
    inMemoryStore.orders = inMemoryStore.orders.filter((o) => o.id !== id);
    res.json({ success: true, message: 'سفارش با موفقیت حذف گردید.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. FAQs Routes
// ==========================================
apiRouter.get('/faqs', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const result = await query('SELECT * FROM faqs ORDER BY sort_order ASC');
      if (result) {
        const faqs = result.rows.map((r) => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          category: r.category,
          order: r.sort_order,
        }));
        res.json({ success: true, faqs });
        return;
      }
    }
    res.json({ success: true, faqs: inMemoryStore.faqs });
  } catch (err: any) {
    res.json({ success: true, faqs: inMemoryStore.faqs });
  }
});

apiRouter.post('/faqs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const f: FAQItem = {
      ...req.body,
      id: req.body.id || `faq-${Date.now()}`,
      order: req.body.order || inMemoryStore.faqs.length + 1,
    };
    if (isDbConnected()) {
      await query(
        'INSERT INTO faqs (id, question, answer, category, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [f.id, f.question, f.answer, f.category, f.order]
      );
    }
    inMemoryStore.faqs.push(f);
    res.json({ success: true, faq: f });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/faqs/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const f = req.body;
  try {
    if (isDbConnected()) {
      await query(
        `UPDATE faqs SET
          question = COALESCE($1, question),
          answer = COALESCE($2, answer),
          category = COALESCE($3, category),
          sort_order = COALESCE($4, sort_order)
        WHERE id = $5`,
        [f.question, f.answer, f.category, f.order, id]
      );
    }
    const idx = inMemoryStore.faqs.findIndex((item) => item.id === id);
    if (idx !== -1) {
      inMemoryStore.faqs[idx] = { ...inMemoryStore.faqs[idx], ...f };
    }
    res.json({ success: true, message: 'پرسش با موفقیت به‌روزرسانی شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/faqs/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      await query('DELETE FROM faqs WHERE id = $1', [id]);
    }
    inMemoryStore.faqs = inMemoryStore.faqs.filter((f) => f.id !== id);
    res.json({ success: true, message: 'پرسش حذف گردید.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. Public Inquiry (Certificates & Orders)
// ==========================================
apiRouter.get('/inquiry', async (req: Request, res: Response) => {
  try {
    const queryTerm = ((req.query.q as string) || '').trim();
    if (!queryTerm || queryTerm.length < 3) {
      res.status(400).json({ success: false, error: 'حداقل ۳ رقم یا حرف برای استعلام وارد کنید.' });
      return;
    }

    // 1. Search enrollments for certificates
    const matchedCertificates: any[] = [];
    const matchedOrders: any[] = [];

    if (isDbConnected()) {
      const certRes = await query(
        `SELECT e.id, e.course_title, e.enrolled_at, e.certificate_issued, s.full_name, s.national_code, s.phone
         FROM course_enrollments e
         JOIN students s ON e.student_id = s.id
         WHERE s.phone LIKE $1 OR s.national_code = $2`,
        [`%${queryTerm}%`, queryTerm]
      );
      if (certRes) {
        matchedCertificates.push(...certRes.rows);
      }

      const orderRes = await query(
        `SELECT order_number, customer_name, total_amount, status, delivery_date, created_at
         FROM orders
         WHERE customer_phone LIKE $1 OR order_number = $2`,
        [`%${queryTerm}%`, queryTerm]
      );
      if (orderRes) {
        matchedOrders.push(...orderRes.rows);
      }
    } else {
      // In-memory lookup
      for (const s of inMemoryStore.students) {
        if (s.phone.includes(queryTerm) || s.nationalCode === queryTerm) {
          for (const e of s.enrollments || []) {
            matchedCertificates.push({
              id: e.id,
              course_title: e.courseTitle,
              enrolled_at: e.enrolledAt,
              certificate_issued: e.certificateIssued,
              full_name: s.fullName,
              phone: s.phone,
            });
          }
        }
      }

      for (const o of inMemoryStore.orders) {
        if (o.customerPhone.includes(queryTerm) || o.orderNumber === queryTerm) {
          matchedOrders.push({
            order_number: o.orderNumber,
            customer_name: o.customerName,
            total_amount: o.totalAmount,
            status: o.status,
            delivery_date: o.deliveryDate,
            created_at: o.createdAt,
          });
        }
      }
    }

    res.json({
      success: true,
      query: queryTerm,
      certificates: matchedCertificates,
      orders: matchedOrders,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
