import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      /**
       * `text-base` en mobile no es una decisión estética: Safari en iPhone hace
       * zoom automático al enfocar cualquier campo con fuente menor a 16px, y
       * después no vuelve al nivel anterior. El usuario queda con la página
       * ampliada y con scroll horizontal en medio del formulario de postulación.
       * Con 16px el zoom no se dispara. En desktop vuelve a 14px, donde el
       * problema no existe.
       *
       * El foco combina borde y anillo. Antes era sólo `ring-2` pegado al
       * borde, que se leía como un contorno sucio en vez de como un estado.
       */
      className={
        "min-h-11 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] " +
        "px-3 py-2.5 text-base text-[var(--color-text)] outline-none " +
        "transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] " +
        "focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        "md:min-h-10 md:text-sm " +
        className
      }
      {...props}
    />
  );
}
