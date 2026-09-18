/** Shared API types — mirrors the shapes the Express server returns. */

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface SearchResult {
  providerId: string;
  thumbUrl: string;
  imageUrl: string;
  sourceUrl: string;
  tags: string[];
  width: number;
  height: number;
  author: string;
}

export interface SavedImage {
  id: string;
  providerId: string;
  imageUrl: string;
  thumbUrl: string;
  sourceUrl: string | null;
  note: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  createdAt: string;
  collectionId: string;
}

export interface Collaborator {
  id: string;
  role: "editor" | "viewer";
  userId: string;
  user: { id: string; username: string; email: string };
}

/** Summary shape used on the boards grid. */
export interface CollectionCard {
  id: string;
  title: string;
  description: string | null;
  shareSlug: string;
  isPublic: boolean;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; username: string };
  _count: { images: number; collaborators: number };
}

/** Full shape returned when opening a single board. */
export interface CollectionDetail extends Omit<CollectionCard, "_count"> {
  images: SavedImage[];
  collaborators?: Collaborator[];
}

/** What the current viewer is allowed to do with a board. */
export type AccessLevel = "owner" | "editor" | "viewer" | "none";
