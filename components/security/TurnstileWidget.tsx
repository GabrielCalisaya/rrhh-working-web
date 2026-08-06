"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Margen para que Cloudflare emita el token nuevo tras un reset. */
const REFRESH_TIMEOUT_MS = 15000;

export type TurnstileHandle = {
  /**
   * Descarta el token actual y devuelve uno nuevo.
   *
   * Los tokens de Turnstile son DE UN SOLO USO: apenas el servidor los valida
   * contra Cloudflare, quedan quemados. Cualquier segundo envío con el mismo
   * token responde "timeout-or-duplicate", que es el error que el usuario ve
   * como "La verificación anti-spam falló".
   *
   * Hace falta llamarlo en dos momentos:
   *  - Entre dos peticiones del mismo envío (subir el CV y crear la
   *    postulación son dos llamadas separadas, y cada una valida el token).
   *  - Después de cualquier intento fallido, para que el reintento no reuse
   *    un token muerto. Sin esto el formulario quedaba trabado: fallaba una
   *    vez y ya no se recuperaba salvo recargando la página.
   */
  refresh: () => Promise<string | null>;
};

type Props = {
  /** Se llama con el token, o con null cuando expira o falla. */
  onToken: (token: string | null) => void;
};

/**
 * Widget de Cloudflare Turnstile.
 *
 * Si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no está configurada, no renderiza nada:
 * el formulario sigue funcionando y el servidor solo exige el token cuando
 * ENABLE_CAPTCHA=true. Eso permite desplegar el código antes de tener las claves.
 */
export const TurnstileWidget = forwardRef<TurnstileHandle, Props>(function TurnstileWidget(
  { onToken },
  ref,
) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  /**
   * Resolver de la promesa de `refresh()`, a la espera del próximo token.
   * Vive en un ref porque lo completa el callback de Cloudflare, que está
   * fuera del ciclo de render de React.
   */
  const pendingRef = useRef<((token: string | null) => void) | null>(null);

  const settlePending = (token: string | null) => {
    const resolve = pendingRef.current;
    if (resolve) {
      pendingRef.current = null;
      resolve(token);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => {
        // Sin clave configurada el captcha está desactivado: no hay nada que
        // refrescar y el servidor tampoco va a pedir token.
        if (!siteKey || !widgetIdRef.current || !window.turnstile) {
          return Promise.resolve(null);
        }

        return new Promise<string | null>((resolve) => {
          // Si un refresh anterior quedó colgado, se lo cierra con null para no
          // dejar promesas sin resolver.
          settlePending(null);
          pendingRef.current = resolve;

          onToken(null);
          window.turnstile!.reset(widgetIdRef.current!);

          // Red de seguridad: si Cloudflare no responde, el formulario sigue
          // su curso en vez de quedarse esperando para siempre.
          setTimeout(() => settlePending(null), REFRESH_TIMEOUT_MS);
        });
      },
    }),
    [siteKey, onToken],
  );

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !window.turnstile || widgetIdRef.current) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey as string,
        theme: "auto",
        callback: (token) => {
          setFailed(false);
          onToken(token);
          settlePending(token);
        },
        "expired-callback": () => {
          onToken(null);
          settlePending(null);
        },
        "error-callback": () => {
          setFailed(true);
          onToken(null);
          settlePending(null);
        },
      });
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", renderWidget);
    script.addEventListener("error", () => setFailed(true));

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) {
    return null;
  }

  return (
    <div>
      <div ref={containerRef} />
      {failed ? (
        <p className="mt-1 text-xs text-[var(--color-danger-text)]" role="alert">
          No se pudo cargar la verificación anti-spam. Revisá tu conexión y recargá la página.
        </p>
      ) : null}
    </div>
  );
});
