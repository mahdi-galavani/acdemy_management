import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';

export interface AdminPayload {
  id: string;
  username: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
}

/**
 * Generate a cryptographically signed JWT token for admin session
 */
export function generateToken(payload: AdminPayload): string {
  // Cast expiresIn to jwt.SignOptions['expiresIn'] to satisfy typescript
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as AdminPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Express Middleware to protect admin routes
 * Enforces Authorization: Bearer <token>
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'عدم احراز هویت: توکن معتبر ارائه نشده است (Unauthorized)',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'توکن نامعتبر یا منقضی شده است. لطفاً مجدداً وارد شوید.',
    });
    return;
  }

  req.admin = decoded;
  next();
}

/**
 * Hash password securely with bcrypt salt rounds = 10
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 10);
}

/**
 * Compare plain password with bcrypt hash
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}
