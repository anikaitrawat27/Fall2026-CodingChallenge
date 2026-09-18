import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * An error that carries an HTTP status code, so controllers can throw
 * meaningful failures instead of hand-writing res.status(...).json(...) everywhere.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(msg = "Bad request") {
    return new ApiError(400, msg);
  }
  static unauthorized(msg = "You must be signed in") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "You do not have access to this collection") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Already exists") {
    return new ApiError(409, msg);
  }
}

/**
 * Wraps an async route handler so a rejected promise reaches the error
 * middleware. Without this, an `await` that throws would hang the request.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
