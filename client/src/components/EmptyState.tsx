import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

/** Shown whenever a list has nothing in it, instead of a blank screen. */
export function EmptyState({ icon, title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <div className="text-ink-soft">{icon}</div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
