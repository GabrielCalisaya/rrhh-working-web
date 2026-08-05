-- Verificación post-migración
--
-- Ejecutar en Supabase > SQL Editor DESPUÉS de schema.sql, rls.sql y seed.sql.
-- Cada bloque imprime OK o FALTA. Si algo dice FALTA, el script correspondiente
-- no se aplicó completo.

-- ---------------------------------------------------------------------------
-- 1. La función de rol existe con el nombre nuevo (no reservado)
-- ---------------------------------------------------------------------------

select
  case when count(*) = 1 then 'OK   ' else 'FALTA' end as estado,
  'public.app_current_role() existe' as verificacion
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'app_current_role';

-- La versión con nombre reservado no debe existir
select
  case when count(*) = 0 then 'OK   ' else 'FALTA' end as estado,
  'public."current_role"() fue eliminada' as verificacion
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'current_role';

-- ---------------------------------------------------------------------------
-- 2. RLS habilitado en las cinco tablas
-- ---------------------------------------------------------------------------

select
  case when c.relrowsecurity then 'OK   ' else 'FALTA' end as estado,
  'RLS habilitado en ' || c.relname as verificacion
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'vacancies', 'candidates', 'applications', 'match_scores')
order by c.relname;

-- ---------------------------------------------------------------------------
-- 3. Las siete políticas existen
-- ---------------------------------------------------------------------------

select
  case when p.policyname is not null then 'OK   ' else 'FALTA' end as estado,
  esperada.tablename || ' :: ' || esperada.policyname as verificacion
from (values
  ('profiles',     'profiles read own'),
  ('profiles',     'staff manage profiles'),
  ('vacancies',    'vacancies open read public'),
  ('vacancies',    'vacancies staff manage'),
  ('candidates',   'staff read candidates'),
  ('applications', 'staff manage applications'),
  ('match_scores', 'staff read matches')
) as esperada(tablename, policyname)
left join pg_policies p
  on p.schemaname = 'public'
  and p.tablename = esperada.tablename
  and p.policyname = esperada.policyname
order by esperada.tablename, esperada.policyname;

-- Recuento total: deben ser 7. Si son 0, rls.sql abortó.
select
  case when count(*) = 7 then 'OK   ' else 'FALTA' end as estado,
  'total de políticas = ' || count(*) || ' (esperado 7)' as verificacion
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'vacancies', 'candidates', 'applications', 'match_scores');

-- ---------------------------------------------------------------------------
-- 4. Bucket de CVs privado y sin uploads directos
-- ---------------------------------------------------------------------------

select
  case when count(*) = 1 then 'OK   ' else 'FALTA' end as estado,
  'bucket cvs existe y es privado' as verificacion
from storage.buckets
where id = 'cvs' and public = false;

select
  case when count(*) >= 2 then 'OK   ' else 'FALTA' end as estado,
  'políticas de storage.objects para cvs = ' || count(*) || ' (esperado >= 2)' as verificacion
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in ('staff read cvs', 'no direct client uploads');

-- ---------------------------------------------------------------------------
-- 5. Seed: perfiles con FK válida a auth.users
-- ---------------------------------------------------------------------------

select
  case when count(*) = 0 then 'OK   ' else 'FALTA' end as estado,
  'perfiles huérfanos (sin auth.users) = ' || count(*) as verificacion
from public.profiles p
where not exists (select 1 from auth.users u where u.id = p.id);

select
  case when count(*) >= 1 then 'OK   ' else 'FALTA' end as estado,
  'perfiles con rol admin = ' || count(*) as verificacion
from public.profiles
where role = 'admin';

-- ---------------------------------------------------------------------------
-- 6. Prueba funcional del bug que bloqueaba a recruiter
-- ---------------------------------------------------------------------------
-- Reemplazá el UUID por el id de un usuario con rol 'recruiter' y ejecutá:
--
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<UUID-DEL-RECRUITER>","role":"authenticated"}';
--   select id, role from public.profiles where id = auth.uid();
--   reset role;
--
-- Antes del fix devolvía 0 filas (y el guard lo expulsaba del panel).
-- Ahora debe devolver exactamente 1 fila.
