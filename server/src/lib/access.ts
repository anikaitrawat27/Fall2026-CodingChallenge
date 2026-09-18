import { prisma } from "./prisma.js";
import { ApiError } from "./errors.js";

/** What a given user is allowed to do with a given collection. */
export type AccessLevel = "owner" | "editor" | "viewer" | "none";

export interface Access {
  collection: NonNullable<Awaited<ReturnType<typeof findCollection>>>;
  level: AccessLevel;
}

function findCollection(id: string) {
  return prisma.collection.findUnique({
    where: { id },
    include: { collaborators: true },
  });
}

/**
 * Resolves a user's permission on a collection in one query.
 *
 * Rules, most permissive wins:
 *   owner   — created it, can delete it and manage collaborators
 *   editor  — invited collaborator, can add/edit/remove images
 *   viewer  — invited as read-only, OR anyone at all if the collection is public
 *   none    — private collection the user has no relationship to
 */
export async function resolveAccess(
  collectionId: string,
  userId?: string,
): Promise<Access> {
  const collection = await findCollection(collectionId);
  if (!collection) throw ApiError.notFound("That collection does not exist");

  let level: AccessLevel = collection.isPublic ? "viewer" : "none";

  if (userId) {
    if (collection.ownerId === userId) {
      level = "owner";
    } else {
      const seat = collection.collaborators.find((c) => c.userId === userId);
      if (seat) level = seat.role === "viewer" ? "viewer" : "editor";
    }
  }

  return { collection, level };
}

/** Throws unless the user can at least see the collection. */
export async function assertCanView(collectionId: string, userId?: string) {
  const access = await resolveAccess(collectionId, userId);
  if (access.level === "none") throw ApiError.forbidden();
  return access;
}

/** Throws unless the user can modify the collection's contents. */
export async function assertCanEdit(collectionId: string, userId?: string) {
  const access = await resolveAccess(collectionId, userId);
  if (access.level !== "owner" && access.level !== "editor") {
    throw ApiError.forbidden("You have read-only access to this collection");
  }
  return access;
}

/** Throws unless the user owns the collection (delete, sharing settings). */
export async function assertIsOwner(collectionId: string, userId?: string) {
  const access = await resolveAccess(collectionId, userId);
  if (access.level !== "owner") {
    throw ApiError.forbidden("Only the owner can do that");
  }
  return access;
}
