import { Router } from "express";
import { search } from "../controllers/search.controller.js";
import { asyncHandler } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/search?q=...&page=1 — proxied Pixabay image search.
// Behind auth so the shared API key can't be drained by anonymous traffic.
router.get("/", requireAuth, asyncHandler(search));

export default router;
