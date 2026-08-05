-- Inspección del estado real de RLS antes de reemplazar políticas.
--
-- Correr en Supabase > SQL Editor y compartir la salida. No modifica nada.
--
-- Motivo: la base tiene un juego de políticas más granular que el de rls.sql
-- (nombres como "vacancies staff select/insert/update/delete" en vez de
-- "vacancies staff manage"). Antes de reemplazarlas hay que saber qué permiten,
-- sobre todo si alguna habilita acceso anónimo a candidates o applications.

select
  tablename,
  policyname,
  cmd                          as operacion,
  roles                        as roles_alcanzados,
  coalesce(qual, '-')          as using_clause,
  coalesce(with_check, '-')    as with_check_clause
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;
