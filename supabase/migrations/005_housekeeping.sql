-- Deuda técnica menor del esquema
--
-- Aplicar después de 004_compliance.sql.

-- ===========================================================================
-- 1. updated_at que efectivamente se actualiza
-- ===========================================================================
-- La columna `vacancies.updated_at` existe desde schema.sql pero nada la tocaba:
-- siempre quedaba igual a created_at, así que era información engañosa.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_vacancies_updated_at on public.vacancies;
create trigger trg_vacancies_updated_at
before update on public.vacancies
for each row
execute function public.touch_updated_at();

-- ===========================================================================
-- 2. Autoría de vacantes
-- ===========================================================================
-- `created_by` era nullable y no se exigía. Para poder auditar quién publicó qué
-- conviene tenerlo siempre, aunque no se fuerza NOT NULL para no romper filas
-- históricas.

create index if not exists idx_vacancies_created_by on public.vacancies(created_by);

-- Nota sobre autorización: la política "vacancies staff manage" permite a
-- cualquier recruiter editar cualquier vacante. Restringir la edición al autor
-- es una decisión de producto (en una consultora chica suele ser deseable que
-- todas puedan tocar todo), así que se deja explícito acá en vez de cambiarlo
-- por defecto. Para restringirlo, reemplazar el `using` de esa política por:
--
--   using (
--     public.app_current_role() = 'admin'
--     or (public.app_current_role() = 'recruiter' and created_by = auth.uid())
--   )
