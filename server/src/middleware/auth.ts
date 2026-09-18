import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../lib/errors.js";

// Adds `userId` to Express's Request type so downstream handlers get it typed.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface TokenPayload {
  userId: string;
}

/** Signs a JWT for a freshly registered or logged-in user. */
export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ userId } satisfies TokenPayload, secret, { expiresIn: "7d" });
}

/** Pulls a bearer token off the Authorization header, if present. */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

/**
 * Hard gate: rejects the request unless a valid token is present.
 * Use on every route that reads or writes a user's own data.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized());

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    next(ApiError.unauthorized("Your session expired — please sign in again"));
  }
}

/**
 * Soft gate: attaches the user if a token is present, but never rejects.
 * Used on public share routes so a signed-in visitor who is also a
 * collaborator gets edit rights, while a stranger still gets read access.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      req.userId = payload.userId;
    } catch {
      /* An invalid token on a public route is simply ignored. */
    }
  }
  next();
}
