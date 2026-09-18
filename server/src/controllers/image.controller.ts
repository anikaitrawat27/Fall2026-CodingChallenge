import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/errors.js";
import { assertCanEdit } from "../lib/access.js";

export const addImageSchema = z.object({
  providerId: z.string().min(1),
  imageUrl: z.string().url(),
  thumbUrl: z.string().url(),
  sourceUrl: z.string().url().optional(),
  note: z.string().max(280).optional(),
  tags: z.array(z.string()).default([]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const updateImageSchema = z.object({
  note: z.string().max(280).nullable().optional(),
  tags: z.array(z.string()).optional(),
});

/** POST /api/collections/:id/images — save an image into a board. */
export async function addImage(req: Request, res: Response) {
  await assertCanEdit(req.params.id, req.userId);
  const body = req.body as z.infer<typeof addImageSchema>;

  // The schema's @@unique([collectionId, providerId]) enforces this too,
  // but checking first lets us return a friendly message instead of a P2002.
  const duplicate = await prisma.image.findUnique({
    where: {
      collectionId_providerId: {
        collectionId: req.params.id,
        providerId: body.providerId,
      },
    },
  });
  if (duplicate) throw ApiError.conflict("That image is already in this board");

  const image = await prisma.image.create({
    data: { ...body, collectionId: req.params.id, addedById: req.userId },
  });

  // The first image saved to a board becomes its cover thumbnail.
  // The write also bumps updatedAt (via @updatedAt), which drives the
  // "recently active" ordering on the boards grid.
  const board = await prisma.collection.findUnique({
    where: { id: req.params.id },
    select: { coverUrl: true },
  });
  await prisma.collection.update({
    where: { id: req.params.id },
    data: board?.coverUrl ? {} : { coverUrl: image.thumbUrl },
  });

  res.status(201).json({ image });
}

/** PATCH /api/collections/:id/images/:imageId — edit a saved image's note or tags. */
export async function updateImage(req: Request, res: Response) {
  await assertCanEdit(req.params.id, req.userId);

  const existing = await prisma.image.findFirst({
    where: { id: req.params.imageId, collectionId: req.params.id },
  });
  if (!existing) throw ApiError.notFound("That image is not in this board");

  const image = await prisma.image.update({
    where: { id: req.params.imageId },
    data: req.body as z.infer<typeof updateImageSchema>,
  });

  res.json({ image });
}

/** DELETE /api/collections/:id/images/:imageId — remove an image from a board. */
export async function deleteImage(req: Request, res: Response) {
  await assertCanEdit(req.params.id, req.userId);

  const existing = await prisma.image.findFirst({
    where: { id: req.params.imageId, collectionId: req.params.id },
    select: { id: true, thumbUrl: true },
  });
  if (!existing) throw ApiError.notFound("That image is not in this board");

  await prisma.image.delete({ where: { id: existing.id } });

  // If we just deleted the cover, promote the next most recent image.
  const board = await prisma.collection.findUnique({
    where: { id: req.params.id },
    select: { coverUrl: true },
  });
  if (board?.coverUrl === existing.thumbUrl) {
    const next = await prisma.image.findFirst({
      where: { collectionId: req.params.id },
      orderBy: { createdAt: "desc" },
      select: { thumbUrl: true },
    });
    await prisma.collection.update({
      where: { id: req.params.id },
      data: { coverUrl: next?.thumbUrl ?? null },
    });
  }

  res.status(204).send();
}
