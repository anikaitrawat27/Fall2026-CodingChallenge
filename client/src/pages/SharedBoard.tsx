import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageOff, Lock } from "lucide-react";
import type { CollectionDetail } from "../lib/types";
import { api } from "../lib/api";
import { SkeletonGrid } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";

/**
 * Public view of a shared board, reachable at /s/:slug without an account.
 * The API still decides what this visitor may see — this page only renders.
 */
export function SharedBoard() {
  const { slug = "" } = useParams();
  const [board, setBoard] = useState<CollectionDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getShared(slug)
      .then(({ collection }) => setBoard(collection))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="skeleton mb-6 h-10 w-64 rounded-lg" />
        <SkeletonGrid />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon={<Lock size={32} />}
          title="This board isn't available"
          message={error || "The link may be wrong, or the owner has made this board private."}
          action={
            <Link to="/">
              <Button>Go to Pinboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b border-line pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Shared board</p>
        <h1 className="mt-1.5 text-3xl font-extrabold text-ink">{board.title}</h1>
        {board.description && <p className="mt-1.5 text-ink-soft">{board.description}</p>}
        <p className="mt-2 text-sm text-ink-soft">
          {board.images.length} images · curated by @{board.owner.username}
        </p>
      </header>

      {board.images.length === 0 ? (
        <EmptyState
          icon={<ImageOff size={32} />}
          title="Nothing here yet"
          message="This board doesn't have any images."
        />
      ) : (
        <div className="masonry">
          {board.images.map((image) => (
            <figure key={image.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <img
                src={image.thumbUrl}
                alt={image.note ?? image.tags.slice(0, 3).join(", ")}
                loading="lazy"
                className="w-full object-cover"
              />
              {image.note && (
                <figcaption className="px-3 py-2.5 text-sm text-ink">{image.note}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
