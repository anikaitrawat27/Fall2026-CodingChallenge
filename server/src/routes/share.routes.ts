import { Router } from "express";
import { getSharedCollection } from "../controllers/collection.controller.js";
import { asyncHandler } from "../lib/errors.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/share/:slug — public read-only view of a shared board.
// optionalAuth (not requireAuth) so strangers can open the link, while a
// signed-in collaborator following the same link still gets edit rights.
router.get("/:slug", optionalAuth, asyncHandler(getSharedCollection));

export default router;
