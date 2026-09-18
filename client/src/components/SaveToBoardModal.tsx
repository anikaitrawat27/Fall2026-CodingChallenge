import { useState } from "react";
import { Images, Plus } from "lucide-react";
import type { CollectionCard, SearchResult } from "../lib/types";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface Props {
  open: boolean;
  image: SearchResult | null;
  boards: CollectionCard[];
  onClose: () => void;
  onSave: (boardId: string, image: SearchResult) => Promise<void>;
  onCreateBoard: (title: string) => Promise<CollectionCard>;
}

/**
 * Picker shown after clicking Save on a search result.
 * Also lets the user create a board on the spot, so saving an image
 * never requires leaving the search page first.
 */
export function SaveToBoardModal({
  open,
  image,
  boards,
  onClose,
  onSave,
  onCreateBoard,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!image) return null;

  const handleSave = async (boardId: string) => {
    setBusyId(boardId);
    try {
      await onSave(boardId, image);
      onClose();
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateAndSave = async () => {
    if (!title.trim()) return;
    setBusyId("new");
    try {
      const board = await onCreateBoard(title.trim());
      await onSave(board.id, image);
      setTitle("");
      setCreating(false);
      onClose();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal open={open} title="Save to board" onClose={onClose}>
      <img
        src={image.thumbUrl}
        alt=""
        className="mb-4 h-36 w-full rounded-xl object-cover"
      />

      {creating ? (
        <div className="flex flex-col gap-3">
          <Input
            label="New board name"
            autoFocus
            value={title}
            maxLength={80}
            placeholder="e.g. Dorm inspiration"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateAndSave()}
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateAndSave} loading={busyId === "new"} disabled={!title.trim()}>
              Create and save
            </Button>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 max-h-64 space-y-1.5 overflow-y-auto">
            {boards.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-soft">
                No boards yet — create your first one below.
              </p>
            )}
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => handleSave(board.id)}
                disabled={busyId !== null}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition
                  hover:bg-canvas disabled:opacity-50"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-canvas">
                  {board.coverUrl ? (
                    <img src={board.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Images size={16} className="text-ink-soft" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{board.title}</span>
                  <span className="block text-xs text-ink-soft">{board._count.images} images</span>
                </span>
                {busyId === board.id && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
                )}
              </button>
            ))}
          </div>

          <Button variant="secondary" className="w-full" onClick={() => setCreating(true)}>
            <Plus size={16} /> Create new board
          </Button>
        </>
      )}
    </Modal>
  );
}
