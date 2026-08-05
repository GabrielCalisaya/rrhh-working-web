import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  /**
   * La elevación al hover se aplica sólo si la tarjeta contiene un enlace, vía
   * el selector `:has(a)`.
   *
   * Elevar todas las tarjetas por igual sería una afordancia falsa: el
   * movimiento le promete al usuario que ahí se puede hacer clic, y en las
   * tarjetas informativas (valores, equipo, datos de contacto) no hay nada que
   * clickear. Con `:has` la regla se decide sola según el contenido, sin tener
   * que pasar una prop en cada uso.
   *
   * El desplazamiento es de 2px: suficiente para percibirse, no tanto como para
   * que la grilla "salte" al pasar el mouse.
   */
  return (
    <article
      className={
        "rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 " +
        "shadow-[var(--rw-shadow-sm)] transition-[box-shadow,transform,border-color] duration-[var(--rw-duration-base)] " +
        "md:p-6 " +
        "[&:has(a):hover]:-translate-y-0.5 [&:has(a):hover]:border-[var(--color-border-strong)] " +
        "[&:has(a):hover]:shadow-[var(--rw-shadow-md)] " +
        className
      }
    >
      {children}
    </article>
  );
}
