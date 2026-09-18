import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/errors.js";

/** Catch-all for URLs that matched no route. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}

/**
 * The single place errors turn into HTTP responses.
 * Every controller throws; this decides status code and body shape.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // Express identifies error middleware by its four-argument signature,
  // so `next` must stay even though it is unused.
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error("[unhandled]", err);
  res.status(500).json({ error: "Something went wrong on our end." });
}
