import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/errors.js";
import { assertCanView, assertIsOwner, resolveAccess } from "../lib/access.js";

export const createCollectionSchema = z.object({
  title: z.string().min(1, "Give your board a title").max(80),
  description: z.string().max(280).optional(),
  isPublic: z.boolean().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const addCollaboratorSchema = z.object({
  // Accept either — people remember usernames, invites often use email.
  identifier: z.string().min(1, "Enter a username or email"),
  role: z.enum(["editor", "viewer"]).default("editor"),
});

/** Summary row for the boards grid: enough to render a card, no image payload. */
const collectionCard = {
  id: true,
  title: true,
  description: true,
  shareSlug: true,
  isPublic: true,
  coverUrl: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, username: true } },
  _count: { select: { images: true, collaborators: true } },
} as const;

/** GET /api/collections — boards the user owns plus boards shared with them. */
export async function listCollections(req: Request, res: Response) {
  const [owned, shared] = await Promise.all([
    prisma.collection.findMany({
      where: { ownerId: req.userId },
      select: collectionCard,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { collaborators: { some: { userId: req.userId } } },
      select: collectionCard,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  res.json({ owned, shared });
}

/** POST /api/collections */
export async function createCollection(req: Request, res: Response) {
  const { title, description, isPublic } = req.body as z.infer<typeof createCollectionSchema>;

  const collection = await prisma.collection.create({
    data: {
      title,
      description,
      isPublic: isPublic ?? false,
      // 10 chars of nanoid is unguessable enough that a share link
      // cannot realistically be brute-forced.
      shareSlug: nanoid(10),
      ownerId: req.userId!,
    },
    select: collectionCard,
  });

  res.status(201).json({ collection });
}

/** GET /api/collections/:id — full board including its images. */
export async function getCollection(req: Request, res: Response) {
  const { level } = await assertCanView(req.params.id, req.userId);

  const collection = await prisma.collection.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, username: true } },
      images: { orderBy: { createdAt: "desc" } },
      collaborators: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });

  // Tell the client what this viewer may do, so the UI can hide dead buttons.
  res.json({ collection, access: level });
}

/** PATCH /api/collections/:id — rename, re-describe, or toggle public/private. */
export async function updateCollection(req: Request, res: Response) {
  await assertIsOwner(req.params.id, req.userId);

  const collection = await prisma.collection.update({
    where: { id: req.params.id },
    data: req.body as z.infer<typeof updateCollectionSchema>,
    select: collectionCard,
  });

  res.json({ collection });
}

/** DELETE /api/collections/:id — cascades to images and collaborator rows. */
export async function deleteCollection(req: Request, res: Response) {
  await assertIsOwner(req.params.id, req.userId);
  await prisma.collection.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

/**
 * GET /api/share/:slug — the public share URL.
 * Uses optionalAuth: a signed-in collaborator opening their own share link
 * still gets edit rights, while a stranger gets a read-only view.
 */
export async function getSharedCollection(req: Request, res: Response) {
  const found = await prisma.collection.findUnique({
    where: { shareSlug: req.params.slug },
    select: { id: true },
  });
  if (!found) throw ApiError.notFound("That share link is not valid");

  const { level } = await resolveAccess(found.id, req.userId);
  if (level === "none") {
    throw ApiError.forbidden("The owner has made this board private");
  }

  const collection = await prisma.collection.findUnique({
    where: { id: found.id },
    include: {
      owner: { select: { id: true, username: true } },
      images: { orderBy: { createdAt: "desc" } },
    },
  });

  res.json({ collection, access: level });
}

/** POST /api/collections/:id/collaborators — invite another account to edit. */
export async function addCollaborator(req: Request, res: Response) {
  const { collection } = await assertIsOwner(req.params.id, req.userId);
  const { identifier, role } = req.body as z.infer<typeof addCollaboratorSchema>;

  const invitee = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
    select: { id: true, username: true, email: true },
  });
  if (!invitee) throw ApiError.notFound(`No account found for "${identifier}"`);
  if (invitee.id === collection.ownerId) {
    throw ApiError.badRequest("You already own this board");
  }

  const existing = await prisma.collaborator.findUnique({
    where: { collectionId_userId: { collectionId: collection.id, userId: invitee.id } },
  });
  if (existing) throw ApiError.conflict(`${invitee.username} already has access`);

  const collaborator = await prisma.collaborator.create({
    data: { collectionId: collection.id, userId: invitee.id, role },
    include: { user: { select: { id: true, username: true, email: true } } },
  });

  res.status(201).json({ collaborator });
}

/** DELETE /api/collections/:id/collaborators/:userId — revoke access. */
export async function removeCollaborator(req: Request, res: Response) {
  await assertIsOwner(req.params.id, req.userId);

  await prisma.collaborator
    .delete({
      where: {
        collectionId_userId: {
          collectionId: req.params.id,
          userId: req.params.userId,
        },
      },
    })
    .catch(() => {
      throw ApiError.notFound("That person is not a collaborator");
    });

  res.status(204).send();
}
