# مستندات جامع فنی: معماری بک‌ند، احراز هویت و داکرایز با PostgreSQL
## سامانه آموزشگاه شیرینی و آشپزی فندق (Fandoq Academy & Confectionery)

> **مخاطب این سند:** مهندسان نرم‌افزار، توسعه‌دهندگان DevSecOps و مدل‌های هوش مصنوعی (AI Agents) آینده که قصد نگهداری، ارتقا یا استقرار این پروژه را دارند.

---

## ۱. نمای کلی معماری (System Architecture)

پروژه به صورت یکپارچه (Unified Full-Stack) طراحی شده است تا ساده‌ترین و در عین حال امن‌ترین حالت استقرار را فراهم آورد:

```text
                                [ اینترنت / مرورگر کلاینت ]
                                             │
                                             ▼ پورت 3000
                       ┌───────────────────────────────────────────────┐
                       │  کانتینر داکر اپلیکیشن (fandoq_app)            │
                       │  Node.js 22 Alpine (Non-root user: node)      │
                       │                                               │
                       │  ┌─────────────────────────────────────────┐  │
                       │  │ Express Full-Stack Server (server.ts)   │  │
                       │  └───────────────────┬─────────────────────┘  │
                       │                      │                        │
                       │         ┌────────────┴───────────┐            │
                       │         ▼                        ▼            │
                       │   /api/* (REST API)      /* (Static Frontend) │
                       │   - JWT Auth & Bcrypt    - React 19 SPA       │
                       │   - Param SQL Queries    - Tailwind CSS 4     │
                       │   - In-Memory Fallback   - Client-side State  │
                       └──────────────────────┬────────────────────────┘
                                              │ شبکه داخلی داکر (fandoq_network)
                                              ▼ پورت 5432
                       ┌───────────────────────────────────────────────┐
                       │  کانتینر دیتابیس (fandoq_postgres)            │
                       │  PostgreSQL 16 Alpine                         │
                       │  - Healthcheck (pg_isready)                   │
                       │  - ذخیره‌سازی داده دائمی (Volume: pgdata)    │
                       └───────────────────────────────────────────────┘
```

### چرا معماری یکپارچه (Unified Full-Stack) انتخاب شد؟
1. **حذف مشکلات CORS و کوکی در مرورگر:** فرانت‌اند و بک‌ند روی یک پورت (`3000`) اجرا می‌شوند؛ بنابراین نیازی به هدرهای پیچیده Cross-Origin نیست.
2. **استقرار تک‌دستوری با داکر:** تنها با اجرای یک دستور `docker compose up -d` کل سامانه (سرور + دیتابیس) بالا می‌آید.
3. **انعطاف در محیط توسعه و تست:** در حالت توسعه محلی اگر داکر یا پستگرس در دسترس نباشد، سرور به طور خودکار به یک لایه ذخیره‌سازی امن Fallback سوئیچ می‌کند و سیستم متوقف نمی‌شود.

---

## ۲. راهنمای استقرار و راه‌اندازی سریع با داکر (Quick Start)

### مرحله ۱: تنظیم متغیرهای محیطی
یک کپی از فایل نمونه متغیرها بسازید:
```bash
cp .env.example .env
```
مقادیر `POSTGRES_PASSWORD` و `JWT_SECRET` را برای محیط عملیاتی به مقادیر امن و تصادفی تغییر دهید.

### مرحله ۲: بیلد و اجرای کانتینرها
```bash
docker compose up -d --build
```

### مرحله ۳: بررسی سلامت کانتینرها
```bash
docker compose ps
docker compose logs -f app
```
پس از چند ثانیه، سامانه در آدرس زیر در دسترس خواهد بود:
- **وب‌سایت و پنل مدیریت:** `http://localhost:3000`
- **اندپوینت بررسی سلامت:** `http://localhost:3000/api/health`

### توقف و حذف کانتینرها (بدون حذف داده‌های دیتابیس):
```bash
docker compose down
```

### حذف کامل همراه با داده‌های دیتابیس (Reset):
```bash
docker compose down -v
```

---

## ۳. امنیت و متغیرهای محیطی (Security Guidelines)

کلیه تنظیمات حساس از طریق فایل `.env` بارگذاری می‌شوند و هیچ رمزی در سورس‌کد هاردکد نشده است:

| متغیر محیطی | مقدار پیش‌فرض | توضیحات امنیتی |
|---|---|---|
| `PORT` | `3000` | پورت وب سرور |
| `NODE_ENV` | `production` | در حالت پروداکشن، لاگ‌های حساس مخفی می‌شوند |
| `POSTGRES_HOST` | `postgres` | نام هاست سرویس دیتابیس در شبکه داکر |
| `POSTGRES_PORT` | `5432` | پورت اتصال به PostgreSQL |
| `POSTGRES_DB` | `fandoq_db` | نام پایگاه داده آموزشگاه |
| `POSTGRES_USER` | `fandoq_user` | نام کاربری دیتابیس |
| `POSTGRES_PASSWORD` | `fandoq_secure_pass_2025` | **بسیار مهم:** در پروداکشن حتماً تغییر کند |
| `JWT_SECRET` | *رشته رندوم* | کلید امضای رمزنگاری توکن‌های JWT ادمین |
| `JWT_EXPIRES_IN` | `7d` | مدت زمان اعتبار نشست ادمین |
| `ADMIN_DEFAULT_USERNAME` | `admin` | نام کاربری ادمین پیش‌فرض |
| `ADMIN_DEFAULT_PASSWORD` | `fandoq@2025` | کلمه عبور پیش‌فرض (تولید هش با Bcrypt) |

### تمهیدات امنیتی اعمال شده:
1. **کوئری‌های پارامتری شده (Parameterized Queries):** تمام ورودی‌های کاربران با `$1, $2, ...` در کلاینت `pg` اجرا می‌شوند که خطر SQL Injection را به صفر می‌رساند.
2. **هشینگ کلمات عبور با Bcrypt:** پسورد ادمین با ۱۰ راند نمک (Salt Rounds = 10) هش می‌شود و هرگز به صورت متن خام در دیتابیس ذخیره نخواهد شد.
3. **احراز هویت بدون وضعیت با JWT (Stateless JWT):** دسترسی به روت‌های مدیریتی نیاز به هدر `Authorization: Bearer <token>` دارد.
4. **کاربر غیر روت در کانتینر داکر (`USER node`):** اجرای فرآیندها درون کانتینر با کاربر سیستمی `node` انجام می‌شود تا از حملات Container Breakout پیشگیری گردد.
5. **محدودسازی حجم بادی درخواست‌ها (`limit: 10mb`):** جلوگیری از حملات پرکردن حافظه سرور (DoS Memory Exhaustion).

---

## ۴. اسکیما و ساختار پایگاه داده PostgreSQL

مایگریشن جداول به صورت خودکار در اولین اتصال سرور اجرا شده و در صورت خالی بودن دیتابیس، داده‌های استاندارد اولیه آموزشگاه فندق تزریق (Seed) می‌شوند:

### جدول مدیران (`admins`):
```sql
CREATE TABLE admins (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);
```

### جدول دوره‌های آموزشی (`courses`):
```sql
CREATE TABLE courses (
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
```

### جدول هنرجویان (`students`):
```sql
CREATE TABLE students (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  national_code VARCHAR(20),
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### جدول سوابق ثبت‌نام چندگانه (`course_enrollments`):
```sql
CREATE TABLE course_enrollments (
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
CREATE INDEX idx_enrollment_student ON course_enrollments(student_id);
```

### جدول سفارشات کیک و شیرینی (`orders`):
```sql
CREATE TABLE orders (
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
```

### جدول تنظیمات عمومی سایت (`site_settings`):
شامل نام برند، تلفن‌ها، بیوگرافی و آرایه پویا از تمام شبکه‌های اجتماعی (اینستاگرام، تلگرام، ایتا، بله، روبیکا، آپارات و...).

---

## ۵. فهرست کامل اندپوینت‌های REST API

| متد | آدرس اندپوینت | سطح دسترسی | شرح کاربرد |
|---|---|---|---|
| `GET` | `/api/health` | عمومی | وضعیت سلامت سرور و اتصال به دیتابیس PostgreSQL |
| `POST` | `/api/auth/login` | عمومی | ورود ادمین با نام کاربری و رمزعبور و دریافت توکن JWT |
| `GET` | `/api/auth/me` | محافظت‌شده (JWT) | احراز هویت توکن فعلی ادمین و دریافت مشخصات کاربری |
| `GET` | `/api/settings` | عمومی | دریافت تنظیمات هدر، فوتر، تلفن‌ها و شبکه‌های اجتماعی |
| `PUT` | `/api/settings` | محافظت‌شده (JWT) | ذخیره و به‌روزرسانی تنظیمات عمومی سایت |
| `GET` | `/api/courses` | عمومی | دریافت لیست کامل دوره‌های آموزشی و کارگاه‌ها |
| `POST` | `/api/courses` | محافظت‌شده (JWT) | ایجاد کارگاه یا دوره جدید |
| `DELETE` | `/api/courses/:id` | محافظت‌شده (JWT) | حذف یک دوره |
| `GET` | `/api/students` | محافظت‌شده (JWT) | پرونده کامل هنرجویان به همراه سابقه ثبت‌نام‌ها |
| `POST` | `/api/students` | محافظت‌شده (JWT) | ثبت هنرجوی جدید |
| `POST` | `/api/students/:id/enroll` | محافظت‌شده (JWT) | ثبت‌نام مجدد یک هنرجو در دوره‌های جدید |
| `DELETE` | `/api/students/:id` | محافظت‌شده (JWT) | حذف پرونده هنرجو |
| `GET` | `/api/products` | عمومی | مشاهده کاتالوگ محصولات کیک و شیرینی |
| `GET` | `/api/orders` | محافظت‌شده (JWT) | لیست کلیه سفارشات ثبت‌شده مشتریان |
| `POST` | `/api/orders` | عمومی | ثبت سفارش جدید کیک/شیرینی توسط مشتری (Checkout) |
| `GET` | `/api/inquiry?q=...` | عمومی | سامانه استعلام عمومی مدارک و پیگیری سفارشات با موبایل |

---

## ۶. راهنمای هوش‌های مصنوعی یا مهندسان آینده (Developer / AI Continuity Guide)

اگر در آینده یک هوش مصنوعی یا توسعه‌دهنده جدید خواست روی پروژه کار کند:
1. **فایل سرور اصلی:** در `/server.ts` قرار دارد. این فایل سرور اکسپرس را بالا آورده و میان‌افزار Vite را در حالت Dev اجرا می‌کند.
2. **تنظیمات و متغیرها:** در `/src/server/config.ts` تعریف شده‌اند. هر متغیر جدیدی را ابتدا در این فایل تعریف کرده و در `.env.example` مستند کنید.
3. **تعامل با دیتابیس:** در `/src/server/db.ts` قرار دارد. برای اجرای کوئری از تابع کمکی `query(sql, params)` استفاده فرمایید تا ضد SQL Injection باشد.
4. **مسیرهای API:** در `/src/server/routes.ts` سازمان‌دهی شده‌اند. برای محافظت از مسیرها، میان‌افزار `requireAuth` را اضافه کنید.
5. **ارتباط فرانت‌اند با سرور:** ماژول `/src/services/apiClient.ts` مسئول ذخیره توکن در `sessionStorage` و ارسال هدر احراز هویت است.
6. **داکر:** فایل‌های `Dockerfile` و `docker-compose.yml` در ریشه مخزن قرار دارند. برای اعمال تغییرات در کانتینرها دستور `docker compose up -d --build` را بزنید.
