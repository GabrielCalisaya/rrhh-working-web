import type { Metadata } from "next";
import { DeletionRequestForm } from "@/components/privacy/DeletionRequestForm";
import { CONTACT } from "@/lib/content/institucional";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Cómo tratamos tus datos personales y cómo pedir su eliminación.",
};

const RETENTION_MONTHS = 12;

export default function PrivacidadPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Privacidad y datos personales</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-primary-dark)]">
          Tratamiento de datos conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-[var(--color-accent)] bg-white p-6 text-sm leading-relaxed shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Qué datos guardamos</h2>
          <p className="mt-2">
            Cuando te postulás a una búsqueda guardamos tu nombre, email, y —si los completás— teléfono, ciudad, perfil
            de LinkedIn, portfolio, habilidades declaradas, carta de presentación y el CV en PDF que adjuntes.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Para qué los usamos</h2>
          <p className="mt-2">
            Únicamente para procesos de selección: evaluar tu perfil frente a las búsquedas abiertas y contactarte si
            avanzás. No vendemos ni cedemos tus datos a terceros con fines comerciales.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Quién puede verlos</h2>
          <p className="mt-2">
            Solo el equipo de reclutamiento de RRHH Working con cuenta habilitada. Los CV se almacenan en un repositorio
            privado y cada descarga queda registrada con el usuario que la realizó.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Cuánto tiempo los conservamos</h2>
          <p className="mt-2">
            {RETENTION_MONTHS} meses desde tu última postulación. Cumplido ese plazo, tu CV se elimina y tus datos
            personales se anonimizan de forma automática. Conservamos las postulaciones sin datos identificatorios solo
            con fines estadísticos.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Tus derechos</h2>
          <p className="mt-2">
            Podés pedir en cualquier momento el acceso, la rectificación o la supresión de tus datos. Para la supresión,
            usá el formulario de abajo. Para lo demás, escribinos a{" "}
            <a className="underline" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            .
          </p>
          <p className="mt-2 text-[var(--color-primary-dark)]">
            La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley 25.326, tiene
            la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las
            normas sobre protección de datos personales.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-xl font-semibold">Eliminar mis datos</h2>
        <p className="mb-4 max-w-2xl text-sm text-[var(--color-primary-dark)]">
          Ingresá el email con el que te postulaste. Vamos a verificar la solicitud y eliminar tus datos y tu CV de
          forma permanente. Por seguridad, respondemos lo mismo exista o no ese email en nuestra base.
        </p>
        <DeletionRequestForm />
      </div>
    </section>
  );
}
