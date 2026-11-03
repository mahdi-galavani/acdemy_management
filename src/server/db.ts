import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from './config';
import {
  INITIAL_COURSES,
  INITIAL_PRODUCTS,
  INITIAL_STUDENTS,
  INITIAL_ORDERS,
  INITIAL_FAQS,
  INITIAL_SITE_SETTINGS,
} from '../data/initialData';

const { Pool } = pg;

export interface DatabaseStatus {
  connected: boolean;
  type: 'postgresql' | 'in_memory_fallback';
  message: string;
  tablesCount?: number;
}

// In-memory fallback cache in case PostgreSQL is not available in local dev without Docker
export const inMemoryStore = {
  admins: [] as Array<{ id: string; username: string; password_hash: string; role: string }>,
  courses: [...INITIAL_COURSES],
  students: [...INITIAL_STUDENTS],
  products: [...INITIAL_PRODUCTS],
  orders: [...INITIAL_ORDERS],
  faqs: [...INITIAL_FAQS],
  siteSettings: { ...INITIAL_SITE_SETTINGS },
};

let pool: pg.Pool | null = null;
let isConnected = false;
let connectionAttempted = false;

export function getPool(): pg.Pool | null {
  if (pool) return pool;

  try {
    const poolConfig: pg.PoolConfig = config.database.url
      ? { connectionString: config.database.url, ssl: config.database.ssl }
      : {
          host: config.database.host,
          port: config.database.port,
          database: config.database.name,
          user: config.database.user,
          password: config.database.password,
          ssl: config.database.ssl,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 3000,
        };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Pool Warning]:', err.message);
      isConnected = false;
    });

    return pool;
  } catch (err: any) {
    console.warn('⚠️ [PostgreSQL Initialization]: Unable to create pool, falling back to memory store.', err.message);
    return null;
  }
}

/**
 * Execute parameterized query safely with SQL injection protection
 */
export async function query<T extends pg.QueryResultRow = any>(sql: string, params?: any[]): Promise<pg.QueryResult<T> | null> {
  const p = getPool();
  if (!p || !isConnected) return null;

  try {
    return await p.query<T>(sql, params);
  } catch (error: any) {
    console.error('❌ [SQL Execution Error]:', error.message, 'SQL:', sql);
    throw error;
  }
}

/**
 * Initialize PostgreSQL tables, indexes, and initial data
 */
export async function initDatabase(): Promise<DatabaseStatus> {
  connectionAttempted = true;
  const p = getPool();
  if (!p) {
    // Seed in-memory admin
    const defaultHash = await bcrypt.hash(config.admin.password, 10);
    inMemoryStore.admins = [
      { id: '1', username: config.admin.username, password_hash: defaultHash, role: 'super_admin' },
    ];
    return {
      connected: false,
      type: 'in_memory_fallback',
      message: 'PostgreSQL pool not available. In-memory data store active.',
    };
  }

  try {
    // Test basic connection
    const client = await p.connect();
    isConnected = true;
    console.log('✅ [PostgreSQL Connected]: Successfully connected to database', config.database.name);

    // 1. Create Admins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      );
    `);

    // 2. Create Courses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        category VARCHAR(100),
        price NUMERIC(15, 2) NOT NULL DEFAULT 0,
        discount_price NUMERIC(15, 2),
        capacity INT DEFAULT 12,
        enrolled_count INT DEFAULT 0,
        format VARCHAR(50) DEFAULT 'in_person',
        format_label VARCHAR(100),
        duration VARCHAR(100),
        sessions_count INT DEFAULT 1,
        certificate VARCHAR(150),
        instructor VARCHAR(100),
        instructor_role VARCHAR(100),
        syllabus_items JSONB DEFAULT '[]'::jsonb,
        prerequisites TEXT,
        level VARCHAR(50),
        start_date VARCHAR(50),
        schedule VARCHAR(150),
        image TEXT,
        status VARCHAR(50) DEFAULT 'registering',
        description TEXT,
        materials_provided BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Students Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        national_code VARCHAR(20),
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(150),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Course Enrollments Table (Many-to-Many with detail)
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id VARCHAR(64) PRIMARY KEY,
        student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
        course_id VARCHAR(64) REFERENCES courses(id) ON DELETE SET NULL,
        course_title VARCHAR(255),
        enrolled_at VARCHAR(50),
        tuition_total NUMERIC(15, 2) DEFAULT 0,
        tuition_paid NUMERIC(15, 2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'pending',
        certificate_issued BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_enrollment_student ON course_enrollments(student_id);
      CREATE INDEX IF NOT EXISTS idx_enrollment_course ON course_enrollments(course_id);
    `);

    // 5. Create Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        price NUMERIC(15, 2) NOT NULL DEFAULT 0,
        is_per_kg BOOLEAN DEFAULT false,
        min_weight_kg NUMERIC(6, 2) DEFAULT 1.0,
        image TEXT,
        description TEXT,
        ingredients JSONB DEFAULT '[]'::jsonb,
        lead_time_days INT DEFAULT 2,
        in_stock BOOLEAN DEFAULT true,
        is_popular BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        delivery_date VARCHAR(50),
        delivery_address TEXT,
        items JSONB DEFAULT '[]'::jsonb,
        total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create FAQs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR(64) PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        sort_order INT DEFAULT 0
      );
    `);

    // 8. Create Site Settings Table (Key-Value Document Store in Postgres)
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default admin if table is empty
    const adminCheck = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      const hashedPass = await bcrypt.hash(config.admin.password, 10);
      await client.query(
        'INSERT INTO admins (id, username, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['admin-1', config.admin.username, hashedPass, 'super_admin']
      );
      console.log(`🔐 [PostgreSQL Admin]: Created default admin user "${config.admin.username}"`);
    }

    // Seed default courses if empty
    const courseCheck = await client.query('SELECT COUNT(*) FROM courses');
    if (parseInt(courseCheck.rows[0].count, 10) === 0) {
      for (const c of INITIAL_COURSES) {
        await client.query(
          `INSERT INTO courses (
            id, title, slug, category, price, discount_price, capacity, enrolled_count,
            format, format_label, duration, sessions_count, certificate, instructor,
            instructor_role, syllabus_items, prerequisites, level, start_date, schedule,
            image, status, description, materials_provided
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
          [
            c.id, c.title, c.slug, c.category, c.price, c.discountPrice || null, c.capacity, c.enrolledCount,
            c.format, c.formatLabel, c.duration, c.sessionsCount, c.certificate, c.instructor,
            c.instructorRole, JSON.stringify(c.syllabusItems), c.prerequisites, c.level, c.startDate, c.schedule,
            c.image, c.status, c.description, c.materialsProvided
          ]
        );
      }
      console.log(`📚 [PostgreSQL Seed]: Seeded ${INITIAL_COURSES.length} initial courses.`);
    }

    // Seed default products if empty
    const productCheck = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCheck.rows[0].count, 10) === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await client.query(
          `INSERT INTO products (
            id, title, category, subcategory, price, is_per_kg, min_weight_kg,
            image, description, ingredients, lead_time_days, in_stock, is_popular
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            p.id, p.title, p.category, p.subcategory, p.price, p.isPerKg, p.minWeightKg || null,
            p.image, p.description, JSON.stringify(p.ingredients), p.leadTimeDays, p.inStock, p.isPopular || false
          ]
        );
      }
      console.log(`🍰 [PostgreSQL Seed]: Seeded ${INITIAL_PRODUCTS.length} initial products.`);
    }

    // Seed students & enrollments if empty
    const studentCheck = await client.query('SELECT COUNT(*) FROM students');
    if (parseInt(studentCheck.rows[0].count, 10) === 0) {
      for (const s of INITIAL_STUDENTS) {
        await client.query(
          `INSERT INTO students (id, full_name, national_code, phone, email, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [s.id, s.fullName, s.nationalCode, s.phone, s.email || null, s.notes || null, new Date().toISOString()]
        );
        for (const e of s.enrollments || []) {
          await client.query(
            `INSERT INTO course_enrollments (
              id, student_id, course_id, course_title, enrolled_at, tuition_total, tuition_paid,
              payment_status, certificate_issued, status, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              e.id, s.id, e.courseId, e.courseTitle, e.enrolledAt, e.tuitionTotal, e.tuitionPaid,
              e.paymentStatus, e.certificateIssued, e.status, e.notes || null
            ]
          );
        }
      }
      console.log(`👥 [PostgreSQL Seed]: Seeded ${INITIAL_STUDENTS.length} initial students.`);
    }

    // Seed FAQs if empty
    const faqCheck = await client.query('SELECT COUNT(*) FROM faqs');
    if (parseInt(faqCheck.rows[0].count, 10) === 0) {
      for (const f of INITIAL_FAQS) {
        await client.query(
          'INSERT INTO faqs (id, question, answer, category, sort_order) VALUES ($1, $2, $3, $4, $5)',
          [f.id, f.question, f.answer, f.category, f.order]
        );
      }
    }

    // Seed Site Settings if empty
    const settingsCheck = await client.query("SELECT COUNT(*) FROM site_settings WHERE id = 'main'");
    if (parseInt(settingsCheck.rows[0].count, 10) === 0) {
      await client.query(
        "INSERT INTO site_settings (id, data) VALUES ('main', $1)",
        [JSON.stringify(INITIAL_SITE_SETTINGS)]
      );
    }

    client.release();

    return {
      connected: true,
      type: 'postgresql',
      message: `Connected to PostgreSQL database '${config.database.name}' successfully. All tables and schemas initialized.`,
      tablesCount: 8,
    };
  } catch (err: any) {
    console.warn('⚠️ [PostgreSQL Connection Note]: Could not connect to PostgreSQL instance:', err.message);
    console.info('💡 Running with robust in-memory fallback. All data operations will function smoothly.');
    isConnected = false;

    // Seed in-memory admin
    const defaultHash = await bcrypt.hash(config.admin.password, 10);
    inMemoryStore.admins = [
      { id: '1', username: config.admin.username, password_hash: defaultHash, role: 'super_admin' },
    ];

    return {
      connected: false,
      type: 'in_memory_fallback',
      message: `PostgreSQL connection unavailable (${err.message}). Using in-memory store.`,
    };
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
