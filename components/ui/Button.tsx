import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const baseClass =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const variantClass =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
      : "border border-[var(--color-primary)] text-[var(--color-primary-dark)] hover:bg-[var(--color-accent)]";

  return <button className={`${baseClass} ${variantClass} ${className}`.trim()} {...props} />;
}
