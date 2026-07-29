insert into profiles (id, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'Admin RRHH', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Recruiter RRHH', 'recruiter')
on conflict (id) do nothing;

insert into vacancies (
  id,
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
values (
  '10000000-0000-0000-0000-000000000001',
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
  '00000000-0000-0000-0000-000000000001'
)
on conflict (id) do nothing;
