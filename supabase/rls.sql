-- Row Level Security
--
-- Aplicar DESPUÉS de schema.sql y ANTES de seed.sql.
-- Este script es idempotente: se puede volver a ejecutar sin error.
--
-- Cambios respecto de la versión anterior:
--   1. La función se llamaba `current_role`, que es palabra reservada en SQL.
--      Postgres la acepta si se la califica con el esquema, pero es un nombre
--      que puede romperse en cualquier contexto donde el parser la interprete
--      como la función built-in. Ahora se llama `app_current_role`.
--   2. `profiles` no tenía política de lectura propia, así que un `recruiter`
--      no podía leer su propia fila y quedaba expulsado del panel por
--      lib/auth/guards.ts. Se agrega "profiles read own".
--   3. Las políticas de staff declaran `to authenticated` de forma explícita
--      en lugar de depender de que la función devuelva NULL para anónimos.
--
-- ESTE SCRIPT REEMPLAZA TODAS LAS POLÍTICAS de las 5 tablas. Si la base tiene
-- políticas creadas por fuera de este archivo, se pierden. Revisá antes con
-- supabase/inspect_policies.sql.

alter table public.profiles      enable row level security;
alter table public.vacancies     enable row level security;
alter table public.candidates    enable row level security;
alter table public.applications  enable row level security;
alter table public.match_scores  enable row level security;

-- ---------------------------------------------------------------------------
-- Reset del estado previo
-- ---------------------------------------------------------------------------
-- Se borran TODAS las políticas de estas tablas, no solo las de nombre conocido.
-- Motivo: en la base ya había un juego más granular ("vacancies staff select",
-- "staff insert candidates", etc.) que este script no conocía. Con drops por
-- nombre, esas políticas sobrevivían y convivían con las nuevas — y como las
-- políticas se combinan con OR, la más permisiva gana. El resultado sería un
-- permiso efectivo distinto del que dice este archivo.
--
-- Además hay que borrarlas ANTES que la función: si no, el drop falla con
-- 2BP01 porque las políticas dependen de ella.

do $reset$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'vacancies', 'candidates', 'applications', 'match_scores')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end
$reset$;

-- Ahora sí: ya nadie depende de la función vieja.
-- Se cita el identificador porque current_role es palabra reservada.
drop function if exists public."current_role"();

create or replace function public.app_current_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.app_current_role() from public;
grant execute on function public.app_current_role() to authenticated;

comment on function public.app_current_role() is
  'Rol del usuario autenticado. SECURITY DEFINER para poder leer profiles sin recursión de políticas. No usar el nombre current_role: es palabra reservada.';

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- Cada usuario autenticado lee su propia fila. Sin esto, guards.ts y session.ts
-- (que consultan con la anon key, no con service role) obtienen NULL para
-- cualquier recruiter y el guard lo redirige fuera del panel.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Los admins gestionan todos los perfiles. Las políticas se evalúan con OR,
-- así que esta convive con la anterior sin restarle nada.
drop policy if exists "staff manage profiles" on public.profiles;
create policy "staff manage profiles"
on public.profiles
for all
to authenticated
using (public.app_current_role() = 'admin')
with check (public.app_current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- vacancies
-- ---------------------------------------------------------------------------

-- Única política intencionalmente pública: el listado de empleos abiertos.
drop policy if exists "vacancies open read public" on public.vacancies;
create policy "vacancies open read public"
on public.vacancies
for select
to anon, authenticated
using (status = 'open');

drop policy if exists "vacancies staff manage" on public.vacancies;
create policy "vacancies staff manage"
on public.vacancies
for all
to authenticated
using (public.app_current_role() in ('admin', 'recruiter'))
with check (public.app_current_role() in ('admin', 'recruiter'));

-- ---------------------------------------------------------------------------
-- candidates / applications / match_scores  (PII: solo staff)
-- ---------------------------------------------------------------------------

drop policy if exists "staff read candidates" on public.candidates;
create policy "staff read candidates"
on public.candidates
for select
to authenticated
using (public.app_current_role() in ('admin', 'recruiter'));

drop policy if exists "staff manage applications" on public.applications;
create policy "staff manage applications"
on public.applications
for all
to authenticated
using (public.app_current_role() in ('admin', 'recruiter'))
with check (public.app_current_role() in ('admin', 'recruiter'));

drop policy if exists "staff read matches" on public.match_scores;
create policy "staff read matches"
on public.match_scores
for select
to authenticated
using (public.app_current_role() in ('admin', 'recruiter'));

comment on table public.applications is
  'Inserción pública se hace por API server con service role; no directo desde cliente.';
