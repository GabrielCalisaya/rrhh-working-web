"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { logError } from "@/lib/observability/log";

/**
 * Pantalla de error de la aplicación.
 *
 * Los error boundaries de Next tienen que ser Client Components: React necesita
 * capturar el error en el cliente para poder ofrecer el reintento.
 *
 * No se muestra `error.message` en pantalla a propósito. Puede contener detalle
 * interno (nombres de tabla, mensajes de Postgres) que no le sirve a la persona
 * y que sí le sirve a quien esté sondeando el sitio. El detalle va al log; al
 * usuario se le da el `digest`, que es lo que permite encontrar ese log después
 * si llama para reportarlo.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("app.error-boundary", error);
  }, [error]);

  return (
    <section className="u-animate-in mx-auto max-w-lg py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-primary-dark)]">
        <Icon name="shield" className="h-6 w-6" />
      </span>

      <h1 className="mt-6 text-2xl font-semibold md:text-3xl">Algo no funcionó como esperábamos</h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-primary-dark)]">
        Fue un problema de nuestro lado, no tuyo. Podés reintentar: en la mayoría de los casos se
        resuelve al segundo intento.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Link href="/">
          <Button variant="secondary">Ir al inicio</Button>
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-6 text-xs text-[var(--color-primary-dark)]">
          Código de referencia: <code className="font-mono">{error.digest}</code>
        </p>
      ) : null}
    </section>
  );
}
