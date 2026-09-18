import { Link } from "react-router-dom";
import { Globe, Images, Lock, Users } from "lucide-react";
import type { CollectionCard } from "../lib/types";

/** One board in the boards grid. */
export function BoardCard({ board }: { board: CollectionCard }) {
  return (
    <Link
      to={`/boards/${board.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition
        hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        {board.coverUrl ? (
          <img
            src={board.coverUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-soft">
            <Images size={28} />
          </div>
        )}

        <span
          title={board.isPublic ? "Anyone with the link can view" : "Only you and collaborators"}
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1
            text-xs font-semibold text-ink shadow-sm"
        >
          {board.isPublic ? <Globe size={12} /> : <Lock size={12} />}
          {board.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate font-bold text-ink">{board.title}</h3>
        {board.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{board.description}</p>
        )}
        <div className="mt-2.5 flex items-center gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <Images size={13} /> {board._count.images}
          </span>
          {board._count.collaborators > 0 && (
            <span className="flex items-center gap-1">
              <Users size={13} /> {board._count.collaborators}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
