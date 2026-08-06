"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { applicationSchema } from "@/lib/validators/application";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

type ApplyFormProps = {
  vacancyId: string;
  vacancyTitle: string;
  /**
   * Requisitos y deseables de ESTA vacante. Son los que alimentan las opciones
   * de experiencia: por eso el formulario sirve para cualquier rubro sin
   * cambiar una línea. Una búsqueda de gastronomía ofrece "manejo de caja" y
   * "atención al público"; una de sistemas, "SQL" y "React".
   */
  requirements?: string[];
  niceToHave?: string[];
};

type FormStatus = "idle" | "success" | "error";

const MAX_CV_BYTES = 5 * 1024 * 1024;
const COVER_LETTER_MAX = 2000;

const FIELD_HINT_CLASS = "mt-1.5 text-xs text-[var(--color-primary-dark)]";

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApplyForm({ vacancyId, vacancyTitle, requirements = [], niceToHave = [] }: ApplyFormProps) {
  const uid = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Experiencia seleccionada por la persona.
  const [selected, setSelected] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [extraSkills, setExtraSkills] = useState<string[]>([]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [letterLength, setLetterLength] = useState(0);

  const id = (name: string) => `${uid}-${name}`;

  /**
   * Sugerencias = requisitos + deseables, sin repetidos.
   *
   * Antes este campo era texto libre con la ayuda "usá las mismas palabras que
   * aparecen en los requisitos de la vacante", y encima los requisitos no se
   * mostraban en ninguna parte. Se le pedía a la persona que adivinara el
   * vocabulario exacto del aviso. Ahora reconoce en lugar de recordar.
   *
   * Efecto secundario importante: `calculateSkillsScore` compara la lista del
   * candidato contra los requisitos. Con texto libre casi nunca coincidía
   * ("excel" vs "Excel avanzado") y el puntaje era ruido. Con opciones tomadas
   * del propio aviso, las coincidencias son exactas y el score pasa a servir.
   */
  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    return [...requirements, ...niceToHave].filter((item) => {
      const key = item.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [requirements, niceToHave]);

  const allSkills = useMemo(() => [...selected, ...extraSkills], [selected, extraSkills]);

  // useCallback: sin esto la referencia cambia en cada render y el widget se
  // vuelve a montar en loop por la dependencia del useEffect.
  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  function toggleSkill(skill: string) {
    setSelected((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );
  }

  function addCustomSkill() {
    const value = customSkill.trim();
    if (!value) return;
    const exists = allSkills.some((item) => item.toLowerCase() === value.toLowerCase());
    if (!exists) setExtraSkills((current) => [...current, value]);
    setCustomSkill("");
  }

  /**
   * Validación del CV en el navegador.
   *
   * El límite de 5 MB se anunciaba pero no se comprobaba hasta el servidor: en
   * un teléfono con datos móviles, la persona subía el archivo entero y recién
   * ahí se enteraba de que no servía.
   */
  function handleCvChange(file: File | null) {
    setCvError(null);

    if (!file) {
      setCvFile(null);
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setCvError("El archivo tiene que ser un PDF.");
      setCvFile(null);
      return;
    }

    if (file.size > MAX_CV_BYTES) {
      setCvError(`El archivo pesa ${formatBytes(file.size)} y el máximo es 5 MB.`);
      setCvFile(null);
      return;
    }

    setCvFile(file);
  }

  async function uploadCv(file: File) {
    const uploadPayload = new FormData();
    uploadPayload.append("file", file);
    uploadPayload.append("vacancyId", vacancyId);
    if (captchaToken) {
      uploadPayload.append("captchaToken", captchaToken);
    }

    const uploadResponse = await fetch("/api/applications/upload-cv", {
      method: "POST",
      body: uploadPayload,
    });

    const uploadResult = (await uploadResponse.json()) as { data?: { path: string }; error?: string };
    if (!uploadResponse.ok || !uploadResult.data?.path) {
      throw new Error(uploadResult.error ?? "No se pudo subir el CV");
    }

    return uploadResult.data.path;
  }

  /**
   * El envío se maneja con `onSubmit` y no con `action={...}`.
   *
   * Con `<form action={fn}>`, React 19 RESETEA el formulario en cuanto la
   * función termina, sin importar si el envío salió bien o mal. El efecto era
   * que un error de validación —un correo mal escrito, el consentimiento sin
   * tildar— borraba todo lo cargado y obligaba a empezar de cero. En un
   * formulario de postulación, eso es directamente perder al candidato.
   *
   * Con `onSubmit` + preventDefault el reset no ocurre y los datos quedan donde
   * estaban. El estado de éxito ya reemplaza el formulario entero, así que no
   * se pierde nada por no resetearlo.
   */
  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit(new FormData(event.currentTarget));
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);
    setFieldErrors({});

    const payload = {
      vacancyId,
      candidate: {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        city: String(formData.get("city") ?? ""),
        linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
        portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
        skills: allSkills,
        consent: formData.get("consent") === "on",
      },
      coverLetter: String(formData.get("coverLetter") ?? ""),
      cvFilePath: undefined as string | undefined,
    };

    // Se valida ANTES de subir el CV: no tiene sentido gastarle los datos a
    // alguien para después rechazarle el formulario por un campo vacío.
    const result = applicationSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[issue.path.length - 1] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setStatus("error");
      setMessage("Revisá los campos marcados.");
      setIsSubmitting(false);

      const firstKey = Object.keys(errors)[0];
      document.getElementById(id(firstKey))?.scrollIntoView({ block: "center" });
      document.getElementById(id(firstKey))?.focus();
      return;
    }

    if (cvFile) {
      try {
        result.data.cvFilePath = await uploadCv(cvFile);
      } catch (error) {
        setStatus("error");
        setMessage((error as Error).message);
        setIsSubmitting(false);
        return;
      }
    }

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // El token va fuera del schema: Zod lo descartaría al parsear en el server.
      body: JSON.stringify({ ...result.data, captchaToken }),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "No se pudo enviar la postulación");
      setIsSubmitting(false);
      return;
    }

    setStatus("success");
    setMessage(data.message ?? "Postulación enviada correctamente");
    setIsSubmitting(false);
  }

  if (status === "success") {
    return (
      <div className="u-animate-in rounded-[var(--rw-radius-lg)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-border)] text-[var(--color-success-text)]">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <p className="mt-4 text-lg font-semibold text-[var(--color-success-text)]">
          ¡Postulación enviada!
        </p>
        <p className="mt-2 text-sm text-[var(--color-success-text)]">
          Recibimos tu postulación para <strong>{vacancyTitle}</strong>. Si tu perfil avanza en el
          proceso, te vamos a contactar al correo que dejaste.
        </p>
        {/* Salida del estado de éxito: antes era un callejón sin retorno. */}
        <a
          href="/empleos"
          className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-success-text)] underline underline-offset-4"
        >
          Ver otras búsquedas abiertas
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="grid gap-8 rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--rw-shadow-sm)] md:p-8"
      aria-label="Formulario de postulación"
    >
      {/* ================= 1. Datos personales =================
          El formulario se divide en tres bloques con encabezado. Era una lista
          plana de nueve campos: dividirlo no lo acorta, pero baja la carga
          percibida, que es lo que hace que alguien lo empiece. */}
      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
          1. Tus datos
        </legend>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={id("fullName")} className="mb-1.5 block text-sm font-medium">
              Nombre y apellido *
            </label>
            <Input
              id={id("fullName")}
              name="fullName"
              autoComplete="name"
              placeholder="Ej. Ana Pérez"
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
            {fieldErrors.fullName ? (
              <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
                {fieldErrors.fullName}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={id("email")} className="mb-1.5 block text-sm font-medium">
              Correo electrónico *
            </label>
            <Input
              id={id("email")}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? (
              <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
                {fieldErrors.email}
              </p>
            ) : (
              <p className={FIELD_HINT_CLASS}>Es la vía por la que te vamos a contactar.</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={id("phone")} className="mb-1.5 block text-sm font-medium">
              Teléfono
            </label>
            <Input
              id={id("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Ej. 388 407 9618"
              aria-invalid={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone ? (
              <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
                {fieldErrors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={id("city")} className="mb-1.5 block text-sm font-medium">
              Localidad
            </label>
            <Input
              id={id("city")}
              name="city"
              placeholder="Ej. San Salvador de Jujuy"
              aria-invalid={Boolean(fieldErrors.city)}
            />
          </div>
        </div>
      </fieldset>

      {/* ================= 2. Experiencia ================= */}
      <fieldset className="grid gap-5 border-t border-[var(--color-border)] pt-6">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
          2. Tu experiencia
        </legend>

        <div>
          <span id={id("skills-label")} className="mb-1.5 block text-sm font-medium">
            ¿Qué sabés hacer? *
          </span>
          <p className="mb-3 text-xs text-[var(--color-primary-dark)]">
            {suggestions.length > 0
              ? "Marcá todo lo que hayas hecho antes, aunque no sea en un trabajo formal. Podés agregar lo que falte."
              : "Contanos qué tareas sabés hacer. Agregá una por una."}
          </p>

          {/* Opciones tomadas del propio aviso. Botones y no checkboxes por el
              área táctil y porque en mobile una grilla de casillas con textos
              largos se vuelve ilegible. `aria-pressed` comunica el estado. */}
          {suggestions.length > 0 ? (
            <div
              role="group"
              aria-labelledby={id("skills-label")}
              className="flex flex-wrap gap-2"
            >
              {suggestions.map((skill) => {
                const isOn = selected.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-[var(--rw-radius-pill)] border px-3.5 py-2 text-sm transition-[background-color,border-color,color] duration-[var(--rw-duration-fast)] md:min-h-9 ${
                      isOn
                        ? "border-[var(--color-primary-dark)] bg-[var(--color-accent-soft)] font-medium text-[var(--color-primary-strong)]"
                        : "border-[var(--color-border-strong)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)]"
                    }`}
                  >
                    {isOn ? <Icon name="check" className="h-3.5 w-3.5 shrink-0" /> : null}
                    {skill}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Campo libre: lo que la persona sabe hacer y el aviso no menciona. */}
          <div className="mt-3 flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor={id("customSkill")} className="sr-only">
                Agregar otra experiencia
              </label>
              <Input
                id={id("customSkill")}
                value={customSkill}
                onChange={(event) => setCustomSkill(event.target.value)}
                onKeyDown={(event) => {
                  // Enter agrega el término en vez de enviar el formulario, que
                  // sería el comportamiento por defecto y una forma segura de
                  // perder todo lo cargado.
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomSkill();
                  }
                }}
                placeholder="Ej. atención al público, manejo de caja, licencia de conducir"
              />
            </div>
            <Button type="button" variant="secondary" onClick={addCustomSkill}>
              Agregar
            </Button>
          </div>

          {extraSkills.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {extraSkills.map((skill) => (
                <li key={skill}>
                  <button
                    type="button"
                    onClick={() => setExtraSkills((current) => current.filter((item) => item !== skill))}
                    className="inline-flex min-h-9 items-center gap-2 rounded-[var(--rw-radius-pill)] border border-[var(--color-primary-dark)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-primary-strong)]"
                    aria-label={`Quitar ${skill}`}
                  >
                    {skill}
                    <span aria-hidden="true" className="text-base leading-none">
                      ×
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {fieldErrors.skills ? (
            <p role="alert" className="mt-2 text-xs text-[var(--color-danger-text)]">
              {fieldErrors.skills}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={id("coverLetter")} className="mb-1.5 block text-sm font-medium">
            Contanos sobre vos
          </label>
          <textarea
            id={id("coverLetter")}
            name="coverLetter"
            maxLength={COVER_LETTER_MAX}
            onChange={(event) => setLetterLength(event.target.value.length)}
            className="min-h-32 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-text)] outline-none transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 md:text-sm"
            placeholder="Por ejemplo: qué experiencia tenés en este tipo de trabajo, por qué te interesa y cuál es tu disponibilidad horaria."
          />
          {/* Las preguntas guía capturan disponibilidad, movilidad y formación
              —los datos que más pesan fuera de IT— sin agregar columnas nuevas
              a la base, que es lo que obligaría a una migración. */}
          <div className="flex items-start justify-between gap-4">
            <p className={FIELD_HINT_CLASS}>Opcional, pero ayuda mucho a conocerte.</p>
            {letterLength > COVER_LETTER_MAX * 0.75 ? (
              <p className={FIELD_HINT_CLASS} aria-live="polite">
                {letterLength} / {COVER_LETTER_MAX}
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      {/* ================= 3. Documentación ================= */}
      <fieldset className="grid gap-5 border-t border-[var(--color-border)] pt-6">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
          3. Documentación
        </legend>

        <div>
          <label htmlFor={id("cvFile")} className="mb-1.5 block text-sm font-medium">
            Tu CV en PDF
          </label>
          {/* Antes decía "(opcional)" y se leía como prescindible. Fuera de los
              perfiles digitales, el CV suele ser el único documento que la
              persona tiene: conviene que se note que conviene adjuntarlo. */}
          <Input
            id={id("cvFile")}
            name="cvFile"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => handleCvChange(event.target.files?.[0] ?? null)}
            className="file:mr-3 file:rounded-[var(--rw-radius-sm)] file:border-0 file:bg-[var(--color-accent-soft)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-primary-strong)]"
          />
          {cvError ? (
            <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
              {cvError}
            </p>
          ) : cvFile ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-success-text)]">
              <Icon name="check" className="h-3.5 w-3.5" />
              {cvFile.name} · {formatBytes(cvFile.size)}
            </p>
          ) : (
            <p className={FIELD_HINT_CLASS}>
              Muy recomendable. Solo PDF, hasta 5 MB. Si no tenés CV armado, podemos ayudarte.
            </p>
          )}
        </div>

        {/* Enlaces al final y agrupados: dejaron de ser dos campos destacados
            con nombre de otro rubro ("Portfolio") para pasar a ser lo que son,
            un dato opcional que la mayoría no va a completar. */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={id("portfolioUrl")} className="mb-1.5 block text-sm font-medium">
              Enlace a tus trabajos
            </label>
            <Input
              id={id("portfolioUrl")}
              name="portfolioUrl"
              type="url"
              placeholder="https://..."
              aria-invalid={Boolean(fieldErrors.portfolioUrl)}
            />
            {fieldErrors.portfolioUrl ? (
              <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
                {fieldErrors.portfolioUrl}
              </p>
            ) : (
              <p className={FIELD_HINT_CLASS}>
                Opcional. Puede ser una web, un Instagram de tu oficio o una carpeta de fotos.
              </p>
            )}
          </div>

          <div>
            <label htmlFor={id("linkedinUrl")} className="mb-1.5 block text-sm font-medium">
              Perfil de LinkedIn
            </label>
            <Input
              id={id("linkedinUrl")}
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/..."
              aria-invalid={Boolean(fieldErrors.linkedinUrl)}
            />
            {fieldErrors.linkedinUrl ? (
              <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
                {fieldErrors.linkedinUrl}
              </p>
            ) : (
              <p className={FIELD_HINT_CLASS}>Opcional.</p>
            )}
          </div>
        </div>
      </fieldset>

      <div className="border-t border-[var(--color-border)] pt-6">
        <label
          className={`flex items-start gap-3 rounded-[var(--rw-radius-md)] border p-3 text-sm transition-colors ${
            fieldErrors.consent
              ? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-subtle)]"
          }`}
        >
          <input
            name="consent"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary-dark)]"
          />
          <span>
            Acepto el tratamiento de mis datos personales para procesos de selección de RRHH
            Working. Conservamos tus datos 12 meses desde tu última postulación y podés pedir su
            eliminación cuando quieras. Ver{" "}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline">
              política de privacidad
            </a>
            .
          </span>
        </label>
        {fieldErrors.consent ? (
          <p role="alert" className="mt-1.5 text-xs text-[var(--color-danger-text)]">
            {fieldErrors.consent}
          </p>
        ) : null}

        <div className="mt-5">
          <TurnstileWidget onToken={handleCaptchaToken} />
        </div>

        {status === "error" && message ? (
          <p
            className="mt-5 rounded-[var(--rw-radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2.5 text-sm text-[var(--color-danger-text)]"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-5 w-full md:w-auto">
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              Enviando postulación...
            </>
          ) : (
            "Enviar postulación"
          )}
        </Button>
      </div>
    </form>
  );
}
