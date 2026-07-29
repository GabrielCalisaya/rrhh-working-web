import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-[var(--color-accent)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none ring-[var(--color-primary)] focus:ring-2 ${className}`.trim()}
      {...props}
    />
  );
}
