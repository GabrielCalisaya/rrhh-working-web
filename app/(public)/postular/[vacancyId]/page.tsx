import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/jobs/ApplyForm";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export default async function PostularPage({ params }: { params: Promise<{ vacancyId: string }> }) {
  const { vacancyId } = await params;
  const supabase = getSupabaseServiceRoleClient();
  const { data: vacancy } = await supabase.from("vacancies").select("id, title, city, description").eq("id", vacancyId).single();

  if (!vacancy) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Postular a {vacancy.title}</h1>
        <p className="text-sm text-[var(--color-primary-dark)]">{vacancy.city}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm">{vacancy.description}</p>
      </div>
      <ApplyForm vacancyId={vacancy.id} />
    </section>
  );
}
