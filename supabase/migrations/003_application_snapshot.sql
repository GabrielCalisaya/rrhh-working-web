-- Snapshot de datos por postulación
--
-- PROBLEMA QUE RESUELVE
-- createApplication hacía `upsert(..., { onConflict: "email" })` sobre
-- `candidates`. El endpoint es anónimo y no verifica la titularidad del email,
-- así que cualquiera que postulara con el email de otra persona sobrescribía su
-- nombre, teléfono, ciudad, LinkedIn, portfolio, skills y ruta de CV. Eso
-- corrompe PII de terceros y permite desvincular a alguien de su CV real.
--
-- SOLUCIÓN
-- El candidato se crea una sola vez y nunca se sobrescribe. Cada postulación
-- guarda su propio snapshot de los datos declarados en ese momento. Además de
-- cerrar el agujero, se gana historial: se puede ver cómo evolucionó el perfil
-- de una persona entre postulaciones.
--
-- Aplicar después de schema.sql.

alter table public.applications
  add column if not exists applicant_full_name    text,
  add column if not exists applicant_phone        text,
  add column if not exists applicant_city         text,
  add column if not exists applicant_linkedin_url text,
  add column if not exists applicant_portfolio_url text,
  add column if not exists applicant_skills       text[] not null default '{}',
  add column if not exists cv_file_path           text;

comment on column public.applications.applicant_full_name is
  'Snapshot de los datos declarados en ESTA postulación. La fila de candidates no se sobrescribe.';
comment on column public.applications.cv_file_path is
  'CV adjuntado en ESTA postulación. candidates.cv_file_path queda como el primero cargado.';

-- Backfill de las postulaciones existentes con los datos actuales del candidato.
update public.applications a
set
  applicant_full_name     = coalesce(a.applicant_full_name, c.full_name),
  applicant_phone         = coalesce(a.applicant_phone, c.phone),
  applicant_city          = coalesce(a.applicant_city, c.city),
  applicant_linkedin_url  = coalesce(a.applicant_linkedin_url, c.linkedin_url),
  applicant_portfolio_url = coalesce(a.applicant_portfolio_url, c.portfolio_url),
  applicant_skills        = case when a.applicant_skills = '{}' then c.skills else a.applicant_skills end,
  cv_file_path            = coalesce(a.cv_file_path, c.cv_file_path)
from public.candidates c
where c.id = a.candidate_id
  and a.applicant_full_name is null;

-- ---------------------------------------------------------------------------
-- Email canónico en minúsculas
-- ---------------------------------------------------------------------------
-- La app normaliza a minúsculas antes de buscar y de insertar. Sin esto,
-- "Ana@x.com" y "ana@x.com" convivirían como dos candidatos distintos y el
-- lookup fallaría contra filas legacy en mayúsculas.

update public.candidates set email = lower(email) where email <> lower(email);

create unique index if not exists idx_candidates_email_lower on public.candidates(lower(email));

create index if not exists idx_applications_candidate on public.applications(candidate_id);
create index if not exists idx_applications_vacancy on public.applications(vacancy_id);
create index if not exists idx_candidates_created_at on public.candidates(created_at desc);
