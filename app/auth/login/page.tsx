import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">Acceso staff</p>
        <h1 className="mt-2 text-3xl font-semibold">Panel RRHH Working</h1>
        <p className="mt-2 text-sm text-[var(--color-primary-dark)]">
          Ingresá con tu cuenta de reclutador o administrador.
        </p>
      </div>
      <Card>
        <Suspense fallback={<p className="text-sm">Cargando formulario...</p>}>
          <LoginForm />
        </Suspense>
      </Card>
      <p className="text-center text-sm text-[var(--color-primary-dark)]">
        <Link href="/" className="underline hover:text-[var(--color-primary)]">
          Volver al sitio público
        </Link>
      </p>
    </section>
  );
}
