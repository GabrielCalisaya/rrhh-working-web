import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
      {children}
    </span>
  );
}
