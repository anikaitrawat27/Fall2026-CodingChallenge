import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ImageOff, Search as SearchIcon } from "lucide-react";
import type { CollectionCard, SearchResult } from "../lib/types";
import { api } from "../lib/api";
import { useToast } from "../hooks/useToast";
import { ImageTile } from "../components/ImageTile";
import { SaveToBoardModal } from "../components/SaveToBoardModal";
import { SkeletonGrid } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";

const SUGGESTIONS = ["mountains", "interior design", "street food", "vintage cars", "cats"];

/** Discover page: search Pixabay and save results into a board. */
export function Search() {
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [boards, setBoards] = useState<CollectionCard[]>([]);
  const [picking, setPicking] = useState<SearchResult | null>(null);
  // providerIds saved this session, so tiles can show a "Saved" state.
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Tracks the newest request so a slow earlier response can't overwrite
  // the results of a newer search.
  const requestId = useRef(0);

  useEffect(() => {
    api
      .listCollections()
      .then(({ owned, shared }) => setBoards([...owned, ...shared]))
      .catch(() => undefined);
  }, []);

  const runSearch = useCallback(
    async (term: string, nextPage = 1) => {
      if (!term.trim()) return;
      const id = ++requestId.current;
      setLoading(true);
      setSearched(true);
      try {
        const data = await api.search(term.trim(), nextPage);
        if (id !== requestId.current) return; // a newer search already won
        setResults((prev) => (nextPage === 1 ? data.results : [...prev, ...data.results]));
        setTotal(data.total);
        setPage(nextPage);
      } catch (err) {
        if (id === requestId.current) notify((err as Error).message, "error");
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [notify],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void runSearch(query, 1);
  };

  const saveImage = async (boardId: string, image: SearchResult) => {
    // Optimistic: mark it saved immediately, roll back if the request fails.
    setSavedIds((prev) => new Set(prev).add(image.providerId));
    try {
      await api.addImage(boardId, {
        providerId: image.providerId,
        imageUrl: image.imageUrl,
        thumbUrl: image.thumbUrl,
        sourceUrl: image.sourceUrl,
        tags: image.tags,
        width: image.width,
        height: image.height,
      });
      const board = boards.find((b) => b.id === boardId);
      notify(`Saved to ${board?.title ?? "your board"}`);
    } catch (err) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(image.providerId);
        return next;
      });
      notify((err as Error).message, "error");
    }
  };

  const createBoard = async (title: string) => {
    const board = await api.createCollection({ title });
    setBoards((prev) => [board, ...prev]);
    return board;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Discover</h1>
        <p className="mt-1 text-sm text-ink-soft">Search millions of free images and save what you like.</p>

        <form onSubmit={submit} className="mx-auto mt-5 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'sunset', 'workspace', 'ramen'…"
              aria-label="Search for images"
              className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm
                outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <Button type="submit" loading={loading && page === 1} disabled={!query.trim()}>
            Search
          </Button>
        </form>

        {!searched && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  void runSearch(s, 1);
                }}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink-soft
                  transition hover:border-brand hover:text-brand"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && page === 1 ? (
        <SkeletonGrid />
      ) : results.length > 0 ? (
        <>
          <div className="masonry">
            {results.map((image) => (
              <ImageTile
                key={`${image.providerId}-${image.thumbUrl}`}
                image={image}
                saved={savedIds.has(image.providerId)}
                onSave={setPicking}
              />
            ))}
          </div>

          {results.length < total && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                loading={loading}
                onClick={() => void runSearch(query, page + 1)}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      ) : searched ? (
        <EmptyState
          icon={<ImageOff size={32} />}
          title="No results"
          message="Nothing matched that search. Try a different word or a broader term."
        />
      ) : null}

      <SaveToBoardModal
        open={picking !== null}
        image={picking}
        boards={boards}
        onClose={() => setPicking(null)}
        onSave={saveImage}
        onCreateBoard={createBoard}
      />
    </div>
  );
}
