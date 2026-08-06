"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Enlaces de staff del header.
 *
 * Es un Client Component a propósito. Antes el Header resolvía la sesión en el
 * servidor con `cookies()`, y como el Header vive en el root layout, eso marcaba
 * como dinámica TODA la aplicación: `/`, `/nosotros`, `/servicios` y `/contacto`
 * son HTML estático y aun así pagaban una llamada a Supabase por visita anónima,
 * sin poder cachearse en CDN.
 *
 * `getSession()` lee la sesión local (cookie), no hace request de red. Para un
 * visitante anónimo resuelve de inmediato a null.
 *
 * Esto NO es un control de seguridad: solo decide qué enlace mostrar. El acceso
 * real lo protegen middleware.ts, requireStaffAccess() y las políticas RLS.
 */
export function StaffNav({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setIsStaff(Boolean(data.session));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsStaff(Boolean(session));
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Mientras se resuelve no se renderiza nada, para no mostrar "Acceso staff" y
  // reemplazarlo por "Panel" un instante después.
  if (isStaff === null) {
    return null;
  }

  const isMobile = variant === "mobile";

  if (!isStaff) {
    return (
      <li>
        <Link
          href="/auth/login"
          className={`inline-flex items-center text-[var(--color-primary-dark)] underline-offset-4 transition-colors hover:text-[var(--color-primary-strong)] hover:underline ${
            isMobile ? "min-h-11" : "min-h-9 px-2"
          }`}
        >
          Acceso staff
        </Link>
      </li>
    );
  }

  return (
    <>
      {/* Separador. El bloque de staff no es navegación del sitio: es otra
          categoría de acción. Un divisor de 1px lo comunica sin necesidad de
          gritar con color o peso tipográfico. Sólo en desktop, donde los ítems
          van en línea; en el menú mobile ya hay un borde que cumple ese rol. */}
      {!isMobile ? (
        <li aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-[var(--color-border-strong)]" />
      ) : null}

      <li>
        <Link
          href="/admin"
          /**
           * El botón antes era un bloque sólido de color pegado al final de la
           * navegación: más alto que los links de al lado y con mucho más peso
           * visual del que le corresponde a un acceso interno del staff, que la
           * mayoría de las visitas ni siquiera ve.
           *
           * Ahora arranca como una pastilla tenue de la misma altura que el
           * resto de los ítems y sólo se vuelve sólido al hacer hover. Pertenece
           * a la barra en vez de estar apoyado encima.
           *
           * `whitespace-nowrap` garantiza que "Panel" nunca se parta en dos
           * líneas ni se recorte cuando la barra se comprime en tablet.
           */
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-3 font-medium text-[var(--color-primary-strong)] transition-[background-color,color,border-color,box-shadow] duration-[var(--rw-duration-fast)] hover:border-[var(--color-primary-dark)] hover:bg-[var(--color-btn-primary-bg)] hover:text-[var(--color-btn-primary-fg)] hover:shadow-[var(--rw-shadow-xs)] ${
            isMobile ? "min-h-11 py-2" : "min-h-9 py-1.5"
          }`}
        >
          <Icon name="chart" className="h-4 w-4 shrink-0" />
          Panel
        </Link>
      </li>

      <li>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className={`inline-flex items-center text-[var(--color-primary-dark)] underline-offset-4 transition-colors hover:text-[var(--color-primary-strong)] hover:underline ${
              isMobile ? "min-h-11" : "min-h-9 px-2"
            }`}
          >
            Salir
          </button>
        </form>
      </li>
    </>
  );
}
