import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, Plus, Users } from "lucide-react";
import type { CollectionCard } from "../lib/types";
import { api } from "../lib/api";
import { useToast } from "../hooks/useToast";
import { BoardCard } from "../components/BoardCard";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { Input, Textarea } from "../components/Input";

/** Home screen: every board the user owns, plus boards shared with them. */
export function Boards() {
  const { notify } = useToast();
  const [owned, setOwned] = useState<CollectionCard[]>([]);
  const [shared, setShared] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { owned, shared } = await api.listCollections();
      setOwned(owned);
      setShared(shared);
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const createBoard = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const board = await api.createCollection({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setOwned((prev) => [board, ...prev]);
      setTitle("");
      setDescription("");
      setCreating(false);
      notify(`Created "${board.title}"`);
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Your boards</h1>
          <p className="text-sm text-ink-soft">Collections of things worth keeping.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> New board
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : owned.length === 0 && shared.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid size={32} />}
          title="No boards yet"
          message="Create your first board, then head to Discover to start filling it with images."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} /> Create a board
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {owned.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>

          {shared.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                <Users size={18} /> Shared with you
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {shared.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal open={creating} title="Create a board" onClose={() => setCreating(false)}>
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            autoFocus
            value={title}
            maxLength={80}
            placeholder="e.g. Apartment ideas"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createBoard()}
          />
          <Textarea
            label="Description (optional)"
            rows={3}
            maxLength={280}
            value={description}
            placeholder="What goes in this board?"
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={createBoard} loading={busy} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
