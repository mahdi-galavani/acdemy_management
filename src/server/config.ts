import dotenv from 'dotenv';
dotenv.config();

export const config = {
  allowMemoryFallback: process.env.ALLOW_MEMORY_FALLBACK === 'true' || (process.env.NODE_ENV !== 'production' && process.env.ALLOW_MEMORY_FALLBACK !== 'false'),
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database credentials (PostgreSQL)
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    name: process.env.POSTGRES_DB || 'fandoq_db',
    user: process.env.POSTGRES_USER || 'fandoq_user',
    password: process.env.POSTGRES_PASSWORD || 'fandoq_secure_pass_2025',
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },

  // JWT Security settings
  jwt: {
    secret: process.env.JWT_SECRET || 'fandoq_academy_jwt_secret_change_in_production_2025_xyz',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Default Administrator (seeded if no admin exists)
  admin: {
    username: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'fandoq@2025',
  },

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
