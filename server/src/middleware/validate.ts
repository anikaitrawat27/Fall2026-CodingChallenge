import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../lib/errors.js";

/**
 * Validates and replaces req.body using a Zod schema.
 * Keeps controllers free of manual "if (!title) return 400" checks.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
        .join("; ");
      return next(ApiError.badRequest(message));
    }
    req.body = parsed.data;
    next();
  };
}
