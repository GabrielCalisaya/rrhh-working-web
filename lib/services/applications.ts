import type { ApplicationInput } from "@/lib/validators/application";
import { calculateSkillsScore } from "@/lib/utils/skills";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const MATCHING_THRESHOLD = Number(process.env.MATCHING_THRESHOLD ?? "70");

function isMatchingEnabled() {
  return process.env.ENABLE_MATCHING === "true";
}

function isAutoEmailEnabled() {
  return process.env.ENABLE_AUTO_EMAIL === "true";
}

export async function createApplication(input: ApplicationInput) {
  const supabase = getSupabaseServiceRoleClient();

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .upsert(
      {
        full_name: input.candidate.fullName,
        email: input.candidate.email,
        phone: input.candidate.phone || null,
        city: input.candidate.city || null,
        linkedin_url: input.candidate.linkedinUrl || null,
        portfolio_url: input.candidate.portfolioUrl || null,
        skills: input.candidate.skills,
        cv_file_path: input.cvFilePath ?? null,
        consent: input.candidate.consent,
      },
      { onConflict: "email" },
    )
    .select("id, skills")
    .single();

  if (candidateError || !candidate) {
    throw new Error(candidateError?.message ?? "No se pudo crear candidato");
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .insert({
      vacancy_id: input.vacancyId,
      candidate_id: candidate.id,
      cover_letter: input.coverLetter || null,
    })
    .select("id, vacancy_id, candidate_id")
    .single();

  if (applicationError) {
    if (applicationError.code === "23505") {
      throw new Error("La persona ya se postuló a esta vacante");
    }
    throw new Error(applicationError.message);
  }

  if (isMatchingEnabled()) {
    const { data: vacancy, error: vacancyError } = await supabase
      .from("vacancies")
      .select("requirements")
      .eq("id", input.vacancyId)
      .single();

    if (!vacancyError && vacancy) {
      const { score, reasons } = calculateSkillsScore(vacancy.requirements ?? [], candidate.skills ?? []);
      await supabase.from("match_scores").upsert(
        {
          vacancy_id: input.vacancyId,
          candidate_id: candidate.id,
          score,
          reasons,
        },
        { onConflict: "vacancy_id,candidate_id" },
      );

      if (isAutoEmailEnabled() && score >= MATCHING_THRESHOLD) {
        await sendMatchingEmailStub(input.candidate.email, score);
      }
    }
  }

  return application;
}

export async function sendMatchingEmailStub(email: string, score: number) {
  return {
    provider: process.env.EMAIL_PROVIDER ?? "stub",
    delivered: false,
    email,
    score,
  };
}
