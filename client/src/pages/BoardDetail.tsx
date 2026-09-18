import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Globe, ImageOff, Lock, Share2, Trash2, Users } from "lucide-react";
import type { AccessLevel, CollectionDetail, SavedImage } from "../lib/types";
import { api } from "../lib/api";
import { useToast } from "../hooks/useToast";
import { SavedImageTile } from "../components/SavedImageTile";
import { ShareModal } from "../components/ShareModal";
import { SkeletonGrid } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";

/** A single board: its images, plus editing and sharing controls. */
export function BoardDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [board, setBoard] = useState<CollectionDetail | null>(null);
  const [access, setAccess] = useState<AccessLevel>("none");
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const canEdit = access === "owner" || access === "editor";
  const isOwner = access === "owner";

  const load = useCallback(async () => {
    try {
      const { collection, access } = await api.getCollection(id);
      setBoard(collection);
      setAccess(access);
    } catch (err) {
      notify((err as Error).message, "error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Optimistic removal — the tile disappears at once and comes back on failure. */
  const removeImage = async (imageId: string) => {
    if (!board) return;
    const snapshot = board.images;
    setBoard({ ...board, images: board.images.filter((i) => i.id !== imageId) });
    try {
      await api.deleteImage(board.id, imageId);
      notify("Removed from board");
    } catch (err) {
      setBoard((prev) => (prev ? { ...prev, images: snapshot } : prev));
      notify((err as Error).message, "error");
    }
  };

  /** Optimistic note edit, with the previous note restored if the save fails. */
  const editNote = async (imageId: string, note: string) => {
    if (!board) return;
    const snapshot = board.images;
    const apply = (images: SavedImage[]) =>
      images.map((i) => (i.id === imageId ? { ...i, note: note || null } : i));
    setBoard({ ...board, images: apply(board.images) });
    try {
      await api.updateImage(board.id, imageId, { note: note || null });
    } catch (err) {
      setBoard((prev) => (prev ? { ...prev, images: snapshot } : prev));
      notify((err as Error).message, "error");
    }
  };

  const toggleVisibility = async (isPublic: boolean) => {
    if (!board) return;
    try {
      await api.updateCollection(board.id, { isPublic });
      setBoard({ ...board, isPublic });
      notify(isPublic ? "Anyone with the link can now view" : "Board is private again");
    } catch (err) {
      notify((err as Error).message, "error");
    }
  };

  const invite = async (identifier: string) => {
    if (!board) return;
    const collaborator = await api.addCollaborator(board.id, identifier);
    setBoard({ ...board, collaborators: [...(board.collaborators ?? []), collaborator] });
    notify(`@${collaborator.user.username} can now edit this board`);
  };

  const revoke = async (userId: string) => {
    if (!board) return;
    try {
      await api.removeCollaborator(board.id, userId);
      setBoard({
        ...board,
        collaborators: (board.collaborators ?? []).filter((c) => c.userId !== userId),
      });
      notify("Access removed");
    } catch (err) {
      notify((err as Error).message, "error");
    }
  };

  const deleteBoard = async () => {
    if (!board) return;
    if (!confirm(`Delete "${board.title}" and all ${board.images.length} images? This cannot be undone.`))
      return;
    try {
      await api.deleteCollection(board.id);
      notify("Board deleted");
      navigate("/");
    } catch (err) {
      notify((err as Error).message, "error");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="skeleton mb-6 h-10 w-64 rounded-lg" />
        <SkeletonGrid />
      </div>
    );
  }
  if (!board) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={15} /> All boards
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-ink">{board.title}</h1>
          {board.description && <p className="mt-1 text-ink-soft">{board.description}</p>}
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <span>{board.images.length} images</span>
            <span className="flex items-center gap-1">
              {board.isPublic ? <Globe size={14} /> : <Lock size={14} />}
              {board.isPublic ? "Public" : "Private"}
            </span>
            {!isOwner && <span>by @{board.owner.username}</span>}
            {(board.collaborators?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Users size={14} /> {board.collaborators!.length} collaborator
                {board.collaborators!.length === 1 ? "" : "s"}
              </span>
            )}
            {access === "viewer" && (
              <span className="rounded-full bg-canvas px-2.5 py-0.5 text-xs font-semibold">
                Read only
              </span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSharing(true)}>
              <Share2 size={15} /> Share
            </Button>
            <Button variant="ghost" onClick={deleteBoard} aria-label="Delete board">
              <Trash2 size={15} />
            </Button>
          </div>
        )}
      </header>

      {board.images.length === 0 ? (
        <EmptyState
          icon={<ImageOff size={32} />}
          title="This board is empty"
          message={
            canEdit
              ? "Head to Discover to find images and save them here."
              : "The owner hasn't added anything yet."
          }
          action={canEdit ? <Link to="/search"><Button>Find images</Button></Link> : undefined}
        />
      ) : (
        <div className="masonry">
          {board.images.map((image) => (
            <SavedImageTile
              key={image.id}
              image={image}
              canEdit={canEdit}
              onEditNote={editNote}
              onRemove={removeImage}
            />
          ))}
        </div>
      )}

      {isOwner && (
        <ShareModal
          open={sharing}
          shareSlug={board.shareSlug}
          isPublic={board.isPublic}
          collaborators={board.collaborators ?? []}
          onClose={() => setSharing(false)}
          onToggleVisibility={toggleVisibility}
          onInvite={invite}
          onRemoveCollaborator={revoke}
        />
      )}
    </div>
  );
}
