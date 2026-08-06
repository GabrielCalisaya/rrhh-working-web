"use client";

import { useCallback, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { CONTACT_SERVICE_OPTIONS, OTHER_SERVICE, contactSchema } from "@/lib/validators/contact";

type Status = "idle" | "sending" | "success" | "error";

const FIELD_CLASS =
  "min-h-11 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-text)] outline-none transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 md:min-h-10 md:text-sm";

const MESSAGE_MAX = 2000;

/** Etiqueta + error, para no repetir el mismo bloque en cada campo. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      {children}
      {/* aria-live: el error se anuncia al aparecer, sin robarle el foco a quien
          está escribiendo. */}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[var(--color-primary-dark)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [service, setService] = useState<string>("");
  const [messageLength, setMessageLength] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // useCallback: sin esto la referencia cambia en cada render y el widget se
  // vuelve a montar en loop por la dependencia del useEffect.
  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  const id = (name: string) => `${uid}-${name}`;

  /**
   * Igual que en el formulario de postulación: con `action={...}` React 19
   * resetea el formulario al terminar, aunque la validación haya fallado, y la
   * persona perdía todo lo escrito. Con `onSubmit` los datos se conservan.
   */
  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit(new FormData(event.currentTarget));
  }

  async function handleSubmit(formData: FormData) {
    setStatus("sending");
    setErrors({});
    setFormError(null);

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      company: String(formData.get("company") ?? ""),
      service: String(formData.get("service") ?? ""),
      serviceOther: String(formData.get("serviceOther") ?? ""),
      message: String(formData.get("message") ?? ""),
      consent: formData.get("consent") === "on",
      website: String(formData.get("website") ?? ""),
    };

    /**
     * Se valida en el cliente ANTES de enviar para que los errores aparezcan al
     * instante y campo por campo. El servidor vuelve a validar con el mismo
     * schema: esta pasada es comodidad, no seguridad.
     */
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus("error");

      // Foco al primer campo con problema. Sin esto, en mobile el error puede
      // quedar fuera de pantalla y el formulario parece no responder.
      const firstKey = Object.keys(fieldErrors)[0];
      if (firstKey) document.getElementById(id(firstKey))?.focus();
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, captchaToken }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setFormError(data.error ?? "No pudimos enviar tu consulta. Probá de nuevo.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setFormError("No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="u-animate-in rounded-[var(--rw-radius-lg)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-border)] text-[var(--color-success-text)]">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <p className="mt-4 text-lg font-semibold text-[var(--color-success-text)]">
          Recibimos tu consulta
        </p>
        <p className="mt-2 text-sm text-[var(--color-success-text)]">
          Te vamos a responder al correo que nos dejaste. Si es urgente, también podés escribirnos
          por teléfono.
        </p>
        {/* Salida del estado de éxito: sin esto el formulario queda en una
            pantalla sin retorno si la persona quiere consultar otra cosa. */}
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setService("");
            setMessageLength(0);
          }}
          className="mt-5 min-h-11 text-sm font-semibold text-[var(--color-success-text)] underline underline-offset-4"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  const isSending = status === "sending";

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="grid gap-5 rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--rw-shadow-sm)] md:p-8"
      aria-label="Formulario de contacto"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field id={id("fullName")} label="Nombre completo *" error={errors.fullName}>
          <Input
            id={id("fullName")}
            name="fullName"
            autoComplete="name"
            placeholder="Ej. Ana Pérez"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? `${id("fullName")}-error` : undefined}
          />
        </Field>

        <Field id={id("email")} label="Correo electrónico *" error={errors.email}>
          <Input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id("email")}-error` : undefined}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field id={id("phone")} label="Teléfono *" error={errors.phone}>
          <Input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Ej. 388 407 9618"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id("phone")}-error` : undefined}
          />
        </Field>

        <Field
          id={id("company")}
          label="Empresa"
          hint="Opcional. Si consultás a título personal, dejalo vacío."
          error={errors.company}
        >
          <Input
            id={id("company")}
            name="company"
            autoComplete="organization"
            placeholder="Ej. Distribuidora del Norte"
          />
        </Field>
      </div>

      <Field id={id("service")} label="Servicio de interés *" error={errors.service}>
        <select
          id={id("service")}
          name="service"
          value={service}
          onChange={(event) => setService(event.target.value)}
          className={FIELD_CLASS}
          aria-invalid={Boolean(errors.service)}
          aria-describedby={errors.service ? `${id("service")}-error` : undefined}
        >
          <option value="">Elegí una opción</option>
          {CONTACT_SERVICE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {/* El campo aparece sólo al elegir "Otro". Mostrarlo siempre sumaría una
          pregunta que la mayoría no tiene que responder. */}
      {service === OTHER_SERVICE ? (
        <div className="u-animate-in">
          <Field
            id={id("serviceOther")}
            label="¿Qué necesitás? *"
            hint="Una línea alcanza."
            error={errors.serviceOther}
          >
            <Input
              id={id("serviceOther")}
              name="serviceOther"
              placeholder="Ej. Capacitación para el equipo de ventas"
              aria-invalid={Boolean(errors.serviceOther)}
              aria-describedby={errors.serviceOther ? `${id("serviceOther")}-error` : undefined}
            />
          </Field>
        </div>
      ) : null}

      <Field id={id("message")} label="Mensaje *" error={errors.message}>
        <textarea
          id={id("message")}
          name="message"
          maxLength={MESSAGE_MAX}
          onChange={(event) => setMessageLength(event.target.value.length)}
          className={`${FIELD_CLASS} min-h-32`}
          placeholder="Contanos qué perfil necesitás cubrir, para cuándo y cualquier detalle que nos ayude a entender la búsqueda."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${id("message")}-error` : undefined}
        />
        {/* El contador sólo aparece cerca del límite: mostrarlo desde el primer
            carácter presiona a escribir corto, que es lo contrario de lo que
            queremos en una consulta. */}
        {messageLength > MESSAGE_MAX * 0.75 ? (
          <p className="mt-1.5 text-right text-xs text-[var(--color-primary-dark)]" aria-live="polite">
            {messageLength} / {MESSAGE_MAX}
          </p>
        ) : null}
      </Field>

      {/* Honeypot: invisible para personas, irresistible para bots. `tabIndex`
          y `aria-hidden` lo sacan del teclado y del lector de pantalla. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id("website")}>No completar</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label
          className={`flex items-start gap-3 rounded-[var(--rw-radius-md)] border p-3 text-sm transition-colors ${
            errors.consent
              ? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-subtle)]"
          }`}
        >
          <input name="consent" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary-dark)]" />
          <span>
            Acepto que RRHH Working use mis datos para responder esta consulta. Podés ver cómo los
            tratamos en la{" "}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              política de privacidad
            </a>
            .
          </span>
        </label>
        {errors.consent ? (
          <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <TurnstileWidget onToken={handleCaptchaToken} />

      {formError ? (
        <p
          role="alert"
          className="rounded-[var(--rw-radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2.5 text-sm text-[var(--color-danger-text)]"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSending} className="w-full sm:w-auto">
        {isSending ? (
          <>
            {/* El spinner reemplaza al texto en el mismo botón: la persona ve
                que su acción fue registrada sin que el layout se mueva. */}
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Enviando...
          </>
        ) : (
          "Enviar consulta"
        )}
      </Button>
    </form>
  );
}
