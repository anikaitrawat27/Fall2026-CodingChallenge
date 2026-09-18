import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { asyncHandler } from "../lib/errors.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register — create an account, returns { user, token }
router.post("/register", validateBody(auth.registerSchema), asyncHandler(auth.register));

// POST /api/auth/login — exchange credentials for a token
router.post("/login", validateBody(auth.loginSchema), asyncHandler(auth.login));

// GET /api/auth/me — restore the current session
router.get("/me", requireAuth, asyncHandler(auth.me));

export default router;
