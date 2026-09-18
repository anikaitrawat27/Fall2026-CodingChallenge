import type { Request, Response } from "express";
import { searchImages } from "../lib/pixabay.js";
import { ApiError } from "../lib/errors.js";

/**
 * GET /api/search?q=sunset&page=1
 * Proxies Pixabay so the API key never reaches the browser.
 */
export async function search(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  if (!q) throw ApiError.badRequest("Add a search term, e.g. /api/search?q=mountains");

  const page = Math.max(1, Number(req.query.page) || 1);
  const { total, results } = await searchImages(q, page);

  res.json({ query: q, page, total, results });
}
