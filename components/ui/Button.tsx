import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  /**
   * `min-h-11` (44px) es el mínimo táctil de WCAG 2.5.5. El botón medía 36px:
   * suficiente con un mouse, incómodo con el pulgar. En desktop baja a 40px,
   * donde la precisión del puntero lo permite.
   *
   * `active:scale` da la confirmación física del toque. Es deliberadamente
   * chico (2%): lo justo para que la pulsación se sienta, no para que se note.
   */
  const baseClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--rw-radius-md)] px-5 py-2.5 text-sm font-semibold " +
    "transition-[background-color,color,box-shadow,transform] duration-[var(--rw-duration-fast)] " +
    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 md:min-h-10";

  /**
   * El hover del secundario cambia fondo Y color de texto a la vez. Antes sólo
   * cambiaba el fondo a `--color-accent`, y el texto quedaba en 3.25:1 sobre
   * ese fondo: el botón perdía accesibilidad justo al interactuar con él, que
   * es el momento en que más importa.
   */
  const variantClass =
    variant === "primary"
      ? "bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-fg)] shadow-[var(--rw-shadow-xs)] hover:bg-[var(--color-btn-primary-bg-hover)] hover:shadow-[var(--rw-shadow-sm)]"
      : "border border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary-dark)] hover:border-[var(--color-primary-dark)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-primary-strong)]";

  return <button className={`${baseClass} ${variantClass} ${className}`.trim()} {...props} />;
}
