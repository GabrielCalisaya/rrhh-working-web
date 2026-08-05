import type { ApplicationInput } from "@/lib/validators/application";
import { isPdfBuffer } from "@/lib/security/pdf";
import { calculateSkillsScore } from "@/lib/utils/skills";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { ApplicationStatusUpdateInput } from "@/lib/validators/application";
import { assertVacancyIsOpen } from "@/lib/services/vacancy-guards";
import { appErrors } from "@/lib/errors";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

// Se lee en cada request, no al importar el módulo: antes era una constante de
// ámbito de módulo y quedaba congelada con el valor del primer arranque.
function matchingThreshold() {
  const parsed = Number(process.env.MATCHING_THRESHOLD ?? "70");
  return Number.isFinite(parsed) ? parsed : 70;
}

function isMatchingEnabled() {
  return process.env.ENABLE_MATCHING === "true";
}

function isAutoEmailEnabled() {
  return process.env.ENABLE_AUTO_EMAIL === "true";
}

function isCvUploadEnabled() {
  return process.env.ENABLE_CV_UPLOAD === "true";
}

type CandidateRow = { id: string; skills: string[] | null };

/**
 * Devuelve el candidato existente para ese email, o lo crea si es la primera vez.
 *
 * Nunca actualiza una fila existente: el endpoint es anónimo y no verifica la
 * titularidad del email, así que permitir la actualización dejaba que cualquiera
 * sobrescribiera la PII de otra persona. Los datos de cada postulación quedan en
 * el snapshot de `applications`.
 */
async function findOrCreateCandidate(
  supabase: ReturnType<typeof getSupabaseServiceRoleClient>,
  input: ApplicationInput,
): Promise<CandidateRow> {
  const email = input.candidate.email.trim().toLowerCase();

  const { data: existing, error: findError } = await supabase
    .from("candidates")
    .select("id, skills")
    .eq("email", email)
    .maybeSingle<CandidateRow>();

  if (findError) {
    throw new Error(`candidates.select falló: ${findError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("candidates")
    .insert({
      full_name: input.candidate.fullName,
      email,
      phone: input.candidate.phone || null,
      city: input.candidate.city || null,
      linkedin_url: input.candidate.linkedinUrl || null,
      portfolio_url: input.candidate.portfolioUrl || null,
      skills: input.candidate.skills,
      cv_file_path: input.cvFilePath ?? null,
      consent: input.candidate.consent,
    })
    .select("id, skills")
    .single<CandidateRow>();

  if (insertError) {
    // Carrera: dos postulaciones simultáneas con el mismo email nuevo. La
    // constraint unique gana y acá recuperamos la fila que ya se creó.
    if (insertError.code === "23505") {
      const { data: raced } = await supabase
        .from("candidates")
        .select("id, skills")
        .eq("email", email)
        .single<CandidateRow>();

      if (raced) {
        return raced;
      }
    }

    throw new Error(`candidates.insert falló: ${insertError.message}`);
  }

  if (!created) {
    throw new Error("candidates.insert no devolvió fila");
  }

  return created;
}

export async function createApplication(input: ApplicationInput) {
  await assertVacancyIsOpen(input.vacancyId);
  const supabase = getSupabaseServiceRoleClient();

  if (input.cvFilePath) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!bucket) {
      throw new Error("SUPABASE_STORAGE_BUCKET no configurado");
    }

    const folderPath = input.cvFilePath.split("/").slice(0, -1).join("/");
    const { data: listed, error: listError } = await supabase.storage.from(bucket).list(folderPath, {
      search: input.cvFilePath.split("/").pop(),
    });

    if (listError || !listed?.some((item) => `${folderPath}/${item.name}` === input.cvFilePath)) {
      throw appErrors.invalidCvReference();
    }
  }

  const candidate = await findOrCreateCandidate(supabase, input);

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .insert({
      vacancy_id: input.vacancyId,
      candidate_id: candidate.id,
      cover_letter: input.coverLetter || null,
      // Snapshot de lo declarado en ESTA postulación. La fila de candidates no
      // se toca: antes, un upsert por email dejaba que cualquiera pisara la PII
      // y el CV de otra persona sin verificar el email.
      applicant_full_name: input.candidate.fullName,
      applicant_phone: input.candidate.phone || null,
      applicant_city: input.candidate.city || null,
      applicant_linkedin_url: input.candidate.linkedinUrl || null,
      applicant_portfolio_url: input.candidate.portfolioUrl || null,
      applicant_skills: input.candidate.skills,
      cv_file_path: input.cvFilePath ?? null,
    })
    .select("id, vacancy_id, candidate_id")
    .single();

  if (applicationError) {
    if (applicationError.code === "23505") {
      throw appErrors.duplicateApplication();
    }
    throw new Error(`applications.insert falló: ${applicationError.message}`);
  }

  if (isMatchingEnabled()) {
    const { data: vacancy, error: vacancyError } = await supabase
      .from("vacancies")
      .select("requirements")
      .eq("id", input.vacancyId)
      .single();

    if (!vacancyError && vacancy) {
      // Skills de ESTA postulación, no las de la fila de candidates (que ahora
      // quedan congeladas en las de la primera vez que se postuló).
      const { score, reasons } = calculateSkillsScore(vacancy.requirements ?? [], input.candidate.skills);
      await supabase.from("match_scores").upsert(
        {
          vacancy_id: input.vacancyId,
          candidate_id: candidate.id,
          score,
          reasons,
        },
        { onConflict: "vacancy_id,candidate_id" },
      );

      if (isAutoEmailEnabled() && score >= matchingThreshold()) {
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
  // Operación de staff: va por el cliente del usuario y la autoriza RLS
  // ("staff manage applications"), no solo el guard de la ruta.
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: input.status })
    .eq("id", input.id)
    .select("id, vacancy_id, candidate_id, status, created_at")
    .single();

  if (error) {
    throw new Error(`applications.update falló: ${error.message}`);
  }

  return data;
}

export async function uploadCvFile(file: File, vacancyId: string) {
  if (!isCvUploadEnabled()) {
    throw appErrors.cvUploadDisabled();
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    throw appErrors.cvTooLarge();
  }

  if (!file.type.includes("pdf")) {
    throw appErrors.cvInvalidType();
  }

  const arrayBuffer = await file.arrayBuffer();
  if (!isPdfBuffer(arrayBuffer)) {
    throw appErrors.cvInvalidType();
  }

  await assertVacancyIsOpen(vacancyId);

  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET no configurado");
  }

  const supabase = getSupabaseServiceRoleClient();
  const filePath = `cvs/${crypto.randomUUID()}.pdf`;
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
    contentType: file.type || "application/pdf",
    upsert: false,
  });

  if (error) {
    throw new Error(`storage.upload falló: ${error.message}`);
  }

  return filePath;
}
