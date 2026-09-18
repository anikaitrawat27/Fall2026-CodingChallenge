import { Router } from "express";
import authRoutes from "./auth.routes.js";
import collectionRoutes from "./collection.routes.js";
import shareRoutes from "./share.routes.js";
import searchRoutes from "./search.routes.js";

/**
 * Mounts every feature router under /api.
 * One place to see the whole surface of the API.
 */
const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/auth", authRoutes);
router.use("/collections", collectionRoutes);
router.use("/share", shareRoutes);
router.use("/search", searchRoutes);

export default router;
