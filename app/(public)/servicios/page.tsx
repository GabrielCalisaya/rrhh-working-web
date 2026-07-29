import { Card } from "@/components/ui/Card";

const SERVICES = [
  {
    title: "Búsqueda y selección",
    description: "Proceso integral para cubrir posiciones clave con evaluación por competencias.",
  },
  {
    title: "People advisory",
    description: "Diseño de estructuras, seniority maps y mejora de experiencia de talento.",
  },
  {
    title: "Reclutamiento continuo",
    description: "Pipeline activo para roles de alta rotación con métricas de conversión.",
  },
];

export default function ServiciosPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Servicios</h1>
      <p className="max-w-3xl text-[var(--color-primary-dark)]">
        Diseñamos procesos de selección sobrios, medibles y enfocados en fit técnico y cultural.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {SERVICES.map((service) => (
          <Card key={service.title}>
            <h2 className="text-lg font-semibold">{service.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-primary-dark)]">{service.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
