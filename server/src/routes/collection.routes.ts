import { Router } from "express";
import * as collections from "../controllers/collection.controller.js";
import * as images from "../controllers/image.controller.js";
import { asyncHandler } from "../lib/errors.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Everything below this line requires a signed-in user.
router.use(requireAuth);

// --- Boards ---------------------------------------------------------------
// GET    /api/collections           list boards I own + boards shared with me
// POST   /api/collections           create a board
router
  .route("/")
  .get(asyncHandler(collections.listCollections))
  .post(validateBody(collections.createCollectionSchema), asyncHandler(collections.createCollection));

// GET    /api/collections/:id       one board with its images
// PATCH  /api/collections/:id       rename / re-describe / toggle visibility
// DELETE /api/collections/:id       delete the board and everything in it
router
  .route("/:id")
  .get(asyncHandler(collections.getCollection))
  .patch(validateBody(collections.updateCollectionSchema), asyncHandler(collections.updateCollection))
  .delete(asyncHandler(collections.deleteCollection));

// --- Images inside a board ------------------------------------------------
// POST   /api/collections/:id/images             save an image
router.post(
  "/:id/images",
  validateBody(images.addImageSchema),
  asyncHandler(images.addImage),
);

// PATCH  /api/collections/:id/images/:imageId    edit its note or tags
// DELETE /api/collections/:id/images/:imageId    remove it from the board
router
  .route("/:id/images/:imageId")
  .patch(validateBody(images.updateImageSchema), asyncHandler(images.updateImage))
  .delete(asyncHandler(images.deleteImage));

// --- Collaborators --------------------------------------------------------
// POST   /api/collections/:id/collaborators          invite an account
// DELETE /api/collections/:id/collaborators/:userId  revoke access
router.post(
  "/:id/collaborators",
  validateBody(collections.addCollaboratorSchema),
  asyncHandler(collections.addCollaborator),
);
router.delete("/:id/collaborators/:userId", asyncHandler(collections.removeCollaborator));

export default router;
