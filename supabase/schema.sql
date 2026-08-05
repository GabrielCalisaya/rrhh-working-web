create extension if not exists "pgcrypto";

-- `create type` no admite IF NOT EXISTS, así que se envuelve para que el script
-- pueda re-ejecutarse. Sin esto falla con 42710 en cualquier base donde el tipo
-- ya exista.
do $enum$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('admin', 'recruiter');
  end if;
end
$enum$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null default 'recruiter',
  created_at timestamptz not null default now()
);

create table if not exists vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  city text not null,
  modality text not null check (modality in ('Presencial', 'Híbrido', 'Remoto')),
  employment_type text not null check (employment_type in ('Full-time', 'Part-time', 'Contrato', 'Pasantía')),
  seniority text not null check (seniority in ('Junior', 'Semi Senior', 'Senior', 'Lead')),
  description text not null,
  requirements text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  status text not null check (status in ('open', 'closed', 'draft')) default 'draft',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  city text,
  linkedin_url text,
  portfolio_url text,
  skills text[] not null default '{}',
  cv_file_path text,
  consent boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  cover_letter text,
  status text not null check (status in ('new', 'review', 'shortlist', 'rejected', 'hired')) default 'new',
  created_at timestamptz not null default now(),
  unique(vacancy_id, candidate_id)
);

create table if not exists match_scores (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  score int not null check (score >= 0 and score <= 100),
  reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(vacancy_id, candidate_id)
);

create index if not exists idx_vacancies_status on vacancies(status);
create index if not exists idx_vacancies_city on vacancies(city);
create index if not exists idx_applications_status on applications(status);
