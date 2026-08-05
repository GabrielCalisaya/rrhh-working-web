"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
export function StaffNav() {
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

  if (!isStaff) {
    return (
      <li>
        <Link href="/auth/login" className="underline hover:text-[var(--color-primary)]">
          Acceso staff
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center rounded-[var(--rw-radius-md)] bg-[var(--color-primary-dark)] px-4 py-2 font-medium text-white transition-colors duration-[var(--rw-duration-fast)] hover:bg-[var(--color-primary-strong)] md:min-h-9"
        >
          Panel
        </Link>
      </li>
      <li>
        <form action="/auth/logout" method="post">
          <button type="submit" className="underline hover:text-[var(--color-primary)]">
            Salir
          </button>
        </form>
      </li>
    </>
  );
}
