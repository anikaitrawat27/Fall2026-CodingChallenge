import axios from "axios";
import type {
  CollectionCard,
  CollectionDetail,
  Collaborator,
  SavedImage,
  SearchResult,
  User,
  AccessLevel,
} from "./types";

const TOKEN_KEY = "pinboard.token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Vite proxies /api to the Express server, so a relative baseURL is enough. */
const client = axios.create({ baseURL: "/api" });

// Attach the bearer token to every outgoing request.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Unwraps the server's `{ error: "..." }` body into a real Error, so every
 * caller can just show `err.message` instead of digging through the response.
 */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : "Network error — is the API server running on port 4000?";
    return Promise.reject(new Error(message));
  },
);

// --- Auth -----------------------------------------------------------------
export const api = {
  register: (body: { email: string; username: string; password: string }) =>
    client.post<{ user: User; token: string }>("/auth/register", body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    client.post<{ user: User; token: string }>("/auth/login", body).then((r) => r.data),

  me: () => client.get<{ user: User }>("/auth/me").then((r) => r.data.user),

  // --- Boards -------------------------------------------------------------
  listCollections: () =>
    client
      .get<{ owned: CollectionCard[]; shared: CollectionCard[] }>("/collections")
      .then((r) => r.data),

  createCollection: (body: { title: string; description?: string; isPublic?: boolean }) =>
    client.post<{ collection: CollectionCard }>("/collections", body).then((r) => r.data.collection),

  getCollection: (id: string) =>
    client
      .get<{ collection: CollectionDetail; access: AccessLevel }>(`/collections/${id}`)
      .then((r) => r.data),

  updateCollection: (
    id: string,
    body: { title?: string; description?: string; isPublic?: boolean },
  ) =>
    client
      .patch<{ collection: CollectionCard }>(`/collections/${id}`, body)
      .then((r) => r.data.collection),

  deleteCollection: (id: string) => client.delete(`/collections/${id}`).then(() => undefined),

  // --- Images -------------------------------------------------------------
  addImage: (collectionId: string, body: Partial<SavedImage> & { providerId: string }) =>
    client
      .post<{ image: SavedImage }>(`/collections/${collectionId}/images`, body)
      .then((r) => r.data.image),

  updateImage: (
    collectionId: string,
    imageId: string,
    body: { note?: string | null; tags?: string[] },
  ) =>
    client
      .patch<{ image: SavedImage }>(`/collections/${collectionId}/images/${imageId}`, body)
      .then((r) => r.data.image),

  deleteImage: (collectionId: string, imageId: string) =>
    client.delete(`/collections/${collectionId}/images/${imageId}`).then(() => undefined),

  // --- Sharing ------------------------------------------------------------
  getShared: (slug: string) =>
    client
      .get<{ collection: CollectionDetail; access: AccessLevel }>(`/share/${slug}`)
      .then((r) => r.data),

  addCollaborator: (collectionId: string, identifier: string, role: "editor" | "viewer" = "editor") =>
    client
      .post<{ collaborator: Collaborator }>(`/collections/${collectionId}/collaborators`, {
        identifier,
        role,
      })
      .then((r) => r.data.collaborator),

  removeCollaborator: (collectionId: string, userId: string) =>
    client.delete(`/collections/${collectionId}/collaborators/${userId}`).then(() => undefined),

  // --- Search -------------------------------------------------------------
  search: (q: string, page = 1) =>
    client
      .get<{ query: string; page: number; total: number; results: SearchResult[] }>("/search", {
        params: { q, page },
      })
      .then((r) => r.data),
};
