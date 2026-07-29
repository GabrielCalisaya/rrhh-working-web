import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <article className="rounded-lg border border-[var(--color-accent)] bg-white p-6 shadow-sm">{children}</article>;
}
