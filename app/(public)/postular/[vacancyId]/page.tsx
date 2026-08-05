import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/jobs/ApplyForm";
import { Badge } from "@/components/ui/Badge";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function PostularPage({ params }: { params: Promise<{ vacancyId: string }> }) {
  const { vacancyId } = await params;
  // Página pública: ya no corre con la llave maestra. RLS
  // ("vacancies open read public") limita la lectura a status = 'open'.
  const supabase = await getSupabaseServerClient();
  const { data: vacancy } = await supabase
    .from("vacancies")
    .select("id, title, city, description, modality, seniority, employment_type")
    .eq("id", vacancyId)
    .eq("status", "open")
    .single();

  if (!vacancy) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <div className="rounded-xl border border-[var(--color-accent)] bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">Vacante abierta</p>
        <h1 className="mt-2 text-3xl font-semibold">{vacancy.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-primary-dark)]">{vacancy.city}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{vacancy.modality}</Badge>
          <Badge>{vacancy.employment_type}</Badge>
          <Badge>{vacancy.seniority}</Badge>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">{vacancy.description}</p>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Completá tu postulación</h2>
        <ApplyForm vacancyId={vacancy.id} vacancyTitle={vacancy.title} />
      </div>
    </section>
  );
}
