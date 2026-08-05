import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

/**
 * 404 propio.
 *
 * El caso más frecuente no es una URL mal escrita: es una búsqueda que se
 * cerró y cuyo enlace sigue circulando por redes o WhatsApp. Por eso el texto
 * nombra esa situación y la salida principal lleva al listado de empleos, no a
 * la home: quien llega acá venía a buscar trabajo.
 */
export default function NotFound() {
  return (
    <section className="u-animate-in mx-auto max-w-lg py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-primary-dark)]">
        <Icon name="search" className="h-6 w-6" />
      </span>

      <h1 className="mt-6 text-2xl font-semibold md:text-3xl">No encontramos esta página</h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-primary-dark)]">
        Puede que el enlace esté mal escrito o que la búsqueda a la que apuntaba ya se haya cerrado.
        Mirá las búsquedas abiertas: puede haber otra que te sirva.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/empleos">
          <Button>Ver empleos disponibles</Button>
        </Link>
        <Link href="/">
          <Button variant="secondary">Ir al inicio</Button>
        </Link>
      </div>
    </section>
  );
}
