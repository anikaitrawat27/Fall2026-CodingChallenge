import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { SavedImage } from "../lib/types";

interface Props {
  image: SavedImage;
  /** Read-only viewers get no edit or delete controls. */
  canEdit: boolean;
  onEditNote: (imageId: string, note: string) => void;
  onRemove: (imageId: string) => void;
}

/** A saved image inside a board, with inline note editing. */
export function SavedImageTile({ image, canEdit, onEditNote, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(image.note ?? "");

  const save = () => {
    onEditNote(image.id, draft.trim());
    setEditing(false);
  };

  return (
    <figure className="group relative overflow-hidden rounded-2xl bg-white shadow-sm">
      <img
        src={image.thumbUrl}
        alt={image.note ?? image.tags.slice(0, 3).join(", ") ?? "Saved image"}
        loading="lazy"
        className="w-full object-cover"
      />

      {canEdit && !editing && (
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit note"
            className="rounded-full bg-white/95 p-2 text-ink shadow transition hover:bg-white"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onRemove(image.id)}
            aria-label="Remove from board"
            className="rounded-full bg-white/95 p-2 text-red-600 shadow transition hover:bg-red-600 hover:text-white"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {editing ? (
        <div className="flex items-center gap-1.5 border-t border-line p-2.5">
          <input
            autoFocus
            value={draft}
            maxLength={280}
            placeholder="Add a note…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            className="min-w-0 flex-1 rounded-lg border border-line px-2.5 py-1.5 text-sm outline-none focus:border-brand"
          />
          <button onClick={save} aria-label="Save note" className="rounded-lg p-1.5 text-green-600 hover:bg-canvas">
            <Check size={16} />
          </button>
          <button
            onClick={() => setEditing(false)}
            aria-label="Cancel"
            className="rounded-lg p-1.5 text-ink-soft hover:bg-canvas"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        image.note && <figcaption className="px-3 py-2.5 text-sm text-ink">{image.note}</figcaption>
      )}
    </figure>
  );
}
