import type { ApplicationInput } from "@/lib/validators/application";
import { calculateSkillsScore } from "@/lib/utils/skills";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { ApplicationStatusUpdateInput } from "@/lib/validators/application";

const MATCHING_THRESHOLD = Number(process.env.MATCHING_THRESHOLD ?? "70");
const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

function isMatchingEnabled() {
  return process.env.ENABLE_MATCHING === "true";
}

function isAutoEmailEnabled() {
  return process.env.ENABLE_AUTO_EMAIL === "true";
}

function isCvUploadEnabled() {
  return process.env.ENABLE_CV_UPLOAD === "true";
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

export async function updateApplicationStatus(input: ApplicationStatusUpdateInput) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: input.status })
    .eq("id", input.id)
    .select("id, vacancy_id, candidate_id, status, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function uploadCvFile(file: File) {
  if (!isCvUploadEnabled()) {
    throw new Error("La carga de CV no está habilitada");
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    throw new Error("El CV supera el tamaño máximo permitido (5MB)");
  }

  if (!file.type.includes("pdf")) {
    throw new Error("Solo se permiten archivos PDF");
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET no configurado");
  }

  const supabase = getSupabaseServiceRoleClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const filePath = `cvs/${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
    contentType: file.type || "application/pdf",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}
