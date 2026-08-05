-- Rate limiting persistente
--
-- El limitador anterior vivía en un Map en memoria del proceso
-- (lib/security/rate-limit.ts). En Vercel serverless cada instancia tiene el
-- suyo y se reinicia en frío, así que el techo declarado nunca se aplicaba de
-- verdad. Esta tabla lo mueve a un estado compartido.
--
-- Aplicar después de schema.sql.

create table if not exists public.rate_limits (
  key        text primary key,
  count      int not null default 0,
  reset_at   timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Sin políticas: solo el service role (que bypassea RLS) toca esta tabla.
-- Ningún cliente debe poder leerla ni escribirla.

create index if not exists idx_rate_limits_reset_at on public.rate_limits(reset_at);

comment on table public.rate_limits is
  'Contadores de rate limiting compartidos entre instancias serverless. Solo accesible por service role.';

-- ---------------------------------------------------------------------------
-- Consumo atómico de una unidad de cuota
-- ---------------------------------------------------------------------------
-- Devuelve allowed = false cuando se superó el límite dentro de la ventana.
-- El insert...on conflict...do update en una sola sentencia evita la condición
-- de carrera entre requests concurrentes: Postgres serializa por fila.

create or replace function public.consume_rate_limit(
  p_key        text,
  p_limit      int,
  p_window_ms  bigint
)
returns table (allowed boolean, retry_after int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now      timestamptz := now();
  v_reset_at timestamptz;
  v_count    int;
begin
  insert into public.rate_limits as rl (key, count, reset_at, updated_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_ms / 1000.0), v_now)
  on conflict (key) do update
    set
      -- Ventana vencida: se reinicia. Vigente: incrementa.
      count = case when rl.reset_at <= v_now then 1 else rl.count + 1 end,
      reset_at = case
        when rl.reset_at <= v_now
        then v_now + make_interval(secs => p_window_ms / 1000.0)
        else rl.reset_at
      end,
      updated_at = v_now
  returning rl.count, rl.reset_at into v_count, v_reset_at;

  return query
  select
    v_count <= p_limit,
    greatest(0, ceil(extract(epoch from (v_reset_at - v_now)))::int);
end;
$$;

revoke all on function public.consume_rate_limit(text, int, bigint) from public, anon, authenticated;

comment on function public.consume_rate_limit(text, int, bigint) is
  'Consume una unidad de cuota de forma atómica. Solo para uso del backend con service role.';

-- ---------------------------------------------------------------------------
-- Limpieza de filas vencidas
-- ---------------------------------------------------------------------------
-- Sin esto la tabla crece indefinidamente (una fila por IP por endpoint).
-- Programalo en Supabase > Database > Cron (pg_cron), por ejemplo cada hora:
--   select cron.schedule('purge-rate-limits', '0 * * * *', 'select public.purge_rate_limits()');

create or replace function public.purge_rate_limits()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.rate_limits where reset_at < now() - interval '1 day';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_rate_limits() from public, anon, authenticated;
