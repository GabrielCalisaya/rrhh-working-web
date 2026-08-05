-- Auditoría, supresión y retención de datos personales
--
-- Contexto legal: la aplicación almacena PII de terceros (nombre, email,
-- teléfono, ciudad, LinkedIn, CV en PDF). La Ley 25.326 de Protección de Datos
-- Personales de Argentina exige poder atender el derecho de supresión y no
-- conservar los datos más allá de lo necesario. Hasta esta migración no había
-- ni política de retención, ni forma de borrar, ni rastro de quién accede.
--
-- Aplicar después de 003_application_snapshot.sql.

-- ===========================================================================
-- 1. Auditoría
-- ===========================================================================
-- Los logs de Vercel se rotan a los pocos días. Para escaladas de privilegio y
-- accesos a PII hace falta poder reconstruir meses hacia atrás.

create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  action      text not null,
  actor_id    uuid references auth.users(id) on delete set null,
  actor_role  text,
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);
create index if not exists idx_audit_log_action on public.audit_log(action);
create index if not exists idx_audit_log_actor on public.audit_log(actor_id);

alter table public.audit_log enable row level security;

-- Solo admin lee la auditoría. Nadie la escribe desde el cliente: los inserts
-- van por service role desde el backend.
drop policy if exists "admin read audit log" on public.audit_log;
create policy "admin read audit log"
on public.audit_log
for select
to authenticated
using (public.app_current_role() = 'admin');

comment on table public.audit_log is
  'Registro append-only de acciones sensibles. Sin política de insert/update/delete a propósito: solo el service role escribe.';

-- ===========================================================================
-- 2. Solicitudes de supresión
-- ===========================================================================
-- El candidato pide la baja desde el sitio público; el staff la ejecuta desde
-- el panel. No se verifica el email por token porque el envío de mails todavía
-- es un stub: la verificación de identidad la hace una persona.

-- `create type` no admite IF NOT EXISTS: se envuelve para que el script sea
-- re-ejecutable, igual que el resto de las migraciones.
do $enum$
begin
  if not exists (select 1 from pg_type where typname = 'deletion_request_status') then
    create type deletion_request_status as enum ('pending', 'completed', 'rejected');
  end if;
end
$enum$;

create table if not exists public.deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  reason       text,
  status       deletion_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references auth.users(id) on delete set null,
  notes        text
);

create index if not exists idx_deletion_requests_status
  on public.deletion_requests(status, requested_at desc);

-- Una sola solicitud pendiente por email: evita que un bot llene la tabla.
create unique index if not exists idx_deletion_requests_pending_email
  on public.deletion_requests(lower(email))
  where status = 'pending';

alter table public.deletion_requests enable row level security;

drop policy if exists "staff manage deletion requests" on public.deletion_requests;
create policy "staff manage deletion requests"
on public.deletion_requests
for all
to authenticated
using (public.app_current_role() in ('admin', 'recruiter'))
with check (public.app_current_role() in ('admin', 'recruiter'));

-- Sin política para anon: la solicitud pública se inserta por service role,
-- igual que la postulación. Así el público no puede leer la cola de bajas.

comment on table public.deletion_requests is
  'Solicitudes de supresión de datos (Ley 25.326). El insert público va por service role; la resolución la hace staff desde el panel.';

-- ===========================================================================
-- 3. Borrado completo de un candidato
-- ===========================================================================
-- Devuelve la lista de rutas de CV a borrar de Storage. El SQL no puede tocar
-- los archivos: el backend las recibe y las elimina del bucket. Si no se
-- devolvieran, quedarían PDFs huérfanos con PII adentro.

create or replace function public.delete_candidate_data(p_email text)
returns table (deleted_candidate_id uuid, cv_paths text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate_id uuid;
  v_paths        text[];
begin
  select id into v_candidate_id
  from public.candidates
  where lower(email) = lower(p_email);

  if v_candidate_id is null then
    return;
  end if;

  -- Rutas de CV de la ficha y de cada postulación (pueden diferir: desde la
  -- migración 003 cada postulación guarda su propio adjunto).
  select array_remove(array_agg(distinct path), null) into v_paths
  from (
    select cv_file_path as path from public.candidates where id = v_candidate_id
    union
    select cv_file_path from public.applications where candidate_id = v_candidate_id
  ) as p;

  -- applications y match_scores caen por ON DELETE CASCADE (ver schema.sql).
  delete from public.candidates where id = v_candidate_id;

  return query select v_candidate_id, coalesce(v_paths, '{}');
end;
$$;

revoke all on function public.delete_candidate_data(text) from public, anon, authenticated;

-- ===========================================================================
-- 4. Retención: anonimizar a los 12 meses
-- ===========================================================================
-- No se borran las postulaciones: se les quita la PII. Así se conservan las
-- métricas (cuántas postulaciones por vacante, tasa de contratación) sin
-- conservar datos personales más allá de lo necesario.

create or replace function public.anonymize_stale_candidates(p_months int default 12)
returns table (anonymized_count int, cv_paths text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff timestamptz := now() - make_interval(months => p_months);
  v_ids    uuid[];
  v_paths  text[];
  v_count  int;
begin
  -- Candidatos cuya postulación más reciente es anterior al corte.
  select array_agg(c.id) into v_ids
  from public.candidates c
  where c.created_at < v_cutoff
    and not exists (
      select 1 from public.applications a
      where a.candidate_id = c.id and a.created_at >= v_cutoff
    );

  if v_ids is null or cardinality(v_ids) = 0 then
    return query select 0, '{}'::text[];
    return;
  end if;

  select array_remove(array_agg(distinct path), null) into v_paths
  from (
    select cv_file_path as path from public.candidates where id = any(v_ids)
    union
    select cv_file_path from public.applications where candidate_id = any(v_ids)
  ) as p;

  update public.candidates
  set
    full_name     = 'Candidato anonimizado',
    -- El email se reemplaza por un placeholder único: la constraint es unique.
    email         = 'anonimizado+' || id::text || '@invalid',
    phone         = null,
    city          = null,
    linkedin_url  = null,
    portfolio_url = null,
    cv_file_path  = null
  where id = any(v_ids);

  update public.applications
  set
    applicant_full_name     = 'Candidato anonimizado',
    applicant_phone         = null,
    applicant_city          = null,
    applicant_linkedin_url  = null,
    applicant_portfolio_url = null,
    cover_letter            = null,
    cv_file_path            = null
  where candidate_id = any(v_ids);

  v_count := cardinality(v_ids);

  insert into public.audit_log (action, target_type, metadata)
  values ('retention.anonymized', 'candidates',
          jsonb_build_object('count', v_count, 'cutoff_months', p_months));

  return query select v_count, coalesce(v_paths, '{}');
end;
$$;

revoke all on function public.anonymize_stale_candidates(int) from public, anon, authenticated;

comment on function public.anonymize_stale_candidates(int) is
  'Anonimiza candidatos sin actividad en N meses y devuelve las rutas de CV a borrar de Storage. Programar con pg_cron; el borrado de archivos lo hace el backend.';
