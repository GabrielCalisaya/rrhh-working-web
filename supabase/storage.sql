-- Storage: bucket privado de CVs
--
-- Alternativa por dashboard: Storage > New bucket, con "Public bucket" DESACTIVADO.
-- Si usás otro nombre, cambiá también SUPABASE_STORAGE_BUCKET en las variables.
--
-- Script idempotente: se puede volver a ejecutar sin error.

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do update set public = false;

-- Lectura: solo staff autenticado con rol en profiles.
drop policy if exists "staff read cvs" on storage.objects;
create policy "staff read cvs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'cvs'
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'recruiter')
  )
);

-- Bloquear uploads directos desde el cliente: la subida va solo por la API con
-- service role, que bypassea RLS.
drop policy if exists "no direct client uploads" on storage.objects;
create policy "no direct client uploads"
on storage.objects
for insert
to authenticated, anon
with check (false);

-- No hay políticas de update ni delete: por defecto Postgres deniega, y el
-- borrado de archivos (baja de datos, retención) lo hace el backend con service
-- role. Se deja explícito para que no parezca un olvido.
