import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <article className={`rounded-lg border border-[var(--color-accent)] bg-white p-6 shadow-sm ${className}`.trim()}>
      {children}
    </article>
  );
}
