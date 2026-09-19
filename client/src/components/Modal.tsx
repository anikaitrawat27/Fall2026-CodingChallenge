import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  /** Optional sub-heading; also read out by screen readers. */
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Dialog built on Radix UI.
 *
 * Radix handles the parts that are easy to get wrong by hand: focus is
 * trapped inside the dialog while it is open and restored to the trigger
 * on close, the rest of the page is hidden from screen readers, Escape
 * and outside-clicks close it, and background scroll is locked.
 */
export function Modal({ open, title, description, onClose, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-[fade-in_150ms_ease-out]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2
            -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none
            data-[state=open]:animate-[pop-in_150ms_ease-out]"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-ink">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-sm text-ink-soft">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              className="rounded-full p-1.5 text-ink-soft transition hover:bg-canvas hover:text-ink"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
