"use client";

import { useEffect, useRef, useState } from "react";

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
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

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
export function TurnstileWidget({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

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
        theme: "light",
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => {
          setFailed(true);
          onToken(null);
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
        <p className="mt-1 text-xs text-red-700" role="alert">
          No se pudo cargar la verificación anti-spam. Revisá tu conexión y recargá la página.
        </p>
      ) : null}
    </div>
  );
}
