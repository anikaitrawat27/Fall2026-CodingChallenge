import { useState } from "react";
import { Check, Copy, Globe, Lock, UserPlus, X } from "lucide-react";
import type { Collaborator } from "../lib/types";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface Props {
  open: boolean;
  shareSlug: string;
  isPublic: boolean;
  collaborators: Collaborator[];
  onClose: () => void;
  onToggleVisibility: (isPublic: boolean) => Promise<void>;
  onInvite: (identifier: string) => Promise<void>;
  onRemoveCollaborator: (userId: string) => Promise<void>;
}

/** Sharing controls: public link toggle plus per-account collaborators. */
export function ShareModal({
  open,
  shareSlug,
  isPublic,
  collaborators,
  onClose,
  onToggleVisibility,
  onInvite,
  onRemoveCollaborator,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const shareUrl = `${window.location.origin}/s/${shareSlug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const invite = async () => {
    if (!identifier.trim()) return;
    setInviting(true);
    setError("");
    try {
      await onInvite(identifier.trim());
      setIdentifier("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal open={open} title="Share this board" onClose={onClose}>
      {/* Public link ------------------------------------------------------ */}
      <div className="mb-5 rounded-xl border border-line p-4">
        <div className="mb-3 flex items-start gap-3">
          <span className="mt-0.5 text-ink-soft">{isPublic ? <Globe size={18} /> : <Lock size={18} />}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">
              {isPublic ? "Anyone with the link" : "Only you and collaborators"}
            </p>
            <p className="text-xs text-ink-soft">
              {isPublic
                ? "Anyone who has the link can view this board."
                : "Turn this on to share a read-only link with anyone."}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => onToggleVisibility(!isPublic)}>
            {isPublic ? "Make private" : "Make public"}
          </Button>
        </div>

        {isPublic && (
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              aria-label="Share link"
              className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink-soft"
            />
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </div>

      {/* Collaborators ---------------------------------------------------- */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Collaborators can add and remove images</p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Invite by username or email"
              value={identifier}
              placeholder="username"
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
              error={error}
            />
          </div>
          <Button onClick={invite} loading={inviting} disabled={!identifier.trim()}>
            <UserPlus size={15} /> Invite
          </Button>
        </div>

        <ul className="mt-3 space-y-1.5">
          {collaborators.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                {c.user.username.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">@{c.user.username}</span>
              <span className="text-xs text-ink-soft">{c.role}</span>
              <button
                onClick={() => onRemoveCollaborator(c.userId)}
                aria-label={`Remove ${c.user.username}`}
                className="rounded-full p-1 text-ink-soft transition hover:bg-white hover:text-red-600"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
