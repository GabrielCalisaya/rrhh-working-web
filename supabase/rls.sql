alter table profiles enable row level security;
alter table vacancies enable row level security;
alter table candidates enable row level security;
alter table applications enable row level security;
alter table match_scores enable row level security;

create or replace function public.current_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create policy "vacancies open read public"
on vacancies
for select
using (status = 'open');

create policy "vacancies staff manage"
on vacancies
for all
using (current_role() in ('admin', 'recruiter'))
with check (current_role() in ('admin', 'recruiter'));

create policy "staff read candidates"
on candidates
for select
using (current_role() in ('admin', 'recruiter'));

create policy "staff manage applications"
on applications
for all
using (current_role() in ('admin', 'recruiter'))
with check (current_role() in ('admin', 'recruiter'));

create policy "staff read matches"
on match_scores
for select
using (current_role() in ('admin', 'recruiter'));

create policy "staff manage profiles"
on profiles
for all
using (current_role() = 'admin')
with check (current_role() = 'admin');

comment on table applications is 'Inserción pública se hace por API server con service role; no directo desde cliente.';
