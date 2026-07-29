import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <section className="grid gap-8">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">Consultoría y selección</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight">Talento humano para equipos que quieren crecer con impacto.</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-primary-dark)]">
          RRHH Working acompaña empresas argentinas en búsqueda, evaluación y contratación de perfiles estratégicos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/empleos">
            <Button>Ver empleos</Button>
          </Link>
          <Link href="/servicios">
            <Button variant="secondary">Conocer servicios</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
