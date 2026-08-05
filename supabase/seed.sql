-- Seed de desarrollo
--
-- REQUISITO PREVIO: crear los usuarios en el dashboard de Supabase
-- (Authentication > Users > Add user), con estos emails:
--
--   admin@rrhhworking.com.ar       -> rol admin
--   recruiter@rrhhworking.com.ar   -> rol recruiter
--
-- `profiles.id` es FK a `auth.users(id)` (ver schema.sql), así que no se pueden
-- inventar UUIDs: la versión anterior insertaba 0000...0001 / 0000...0002 y
-- fallaba con violación de clave foránea. Este script resuelve los ids reales
-- consultando auth.users por email.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar nada.

-- ---------------------------------------------------------------------------
-- 1. Avisar si faltan los usuarios de auth
-- ---------------------------------------------------------------------------

do $$
declare
  faltantes text;
begin
  select string_agg(v.email, ', ')
    into faltantes
  from (values
    ('admin@rrhhworking.com.ar'),
    ('recruiter@rrhhworking.com.ar')
  ) as v(email)
  where not exists (
    select 1 from auth.users u where lower(u.email) = lower(v.email)
  );

  if faltantes is not null then
    raise warning
      'Seed incompleto. Faltan estos usuarios en auth.users: %. Crealos en Authentication > Users y volvé a ejecutar este script.',
      faltantes;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Perfiles (solo para los usuarios de auth que existan)
-- ---------------------------------------------------------------------------

insert into public.profiles (id, full_name, role)
select u.id, v.full_name, v.role::app_role
from (values
  ('admin@rrhhworking.com.ar',     'Admin RRHH',     'admin'),
  ('recruiter@rrhhworking.com.ar', 'Recruiter RRHH', 'recruiter')
) as v(email, full_name, role)
join auth.users u on lower(u.email) = lower(v.email)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Vacante de ejemplo, atribuida al perfil admin
-- ---------------------------------------------------------------------------

insert into public.vacancies (
  title,
  slug,
  city,
  modality,
  employment_type,
  seniority,
  description,
  requirements,
  nice_to_have,
  status,
  created_by
)
select
  'Frontend Developer React',
  'frontend-developer-react',
  'Buenos Aires',
  'Híbrido',
  'Full-time',
  'Semi Senior',
  'Participar en desarrollo de producto con foco en experiencia web.',
  array['React', 'TypeScript', 'Testing Library'],
  array['Next.js', 'Supabase'],
  'open',
  p.id
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = 'admin@rrhhworking.com.ar'
on conflict (slug) do nothing;
