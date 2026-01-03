-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin','super_admin')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  admin_notes text null
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Analysis runs table (admin/global)
create table if not exists public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  input_text text,
  char_count int,
  verdict text check (verdict in ('Likely AI','Unclear','Likely Human')),
  confidence numeric(5,2),
  breakdown jsonb,
  signals jsonb,
  model text,
  webhook_status text check (webhook_status in ('success','error','timeout')),
  webhook_duration_ms int,
  error_message text,
  raw_response jsonb,
  parent_run_id uuid null references public.analysis_runs(id),
  reviewed boolean not null default false,
  review_label text null check (review_label in ('false_positive','false_negative','unknown')),
  created_at timestamptz not null default now()
);

create index if not exists analysis_runs_created_at_idx
  on public.analysis_runs (created_at desc);
create index if not exists analysis_runs_user_id_created_at_idx
  on public.analysis_runs (user_id, created_at desc);
create index if not exists analysis_runs_verdict_created_at_idx
  on public.analysis_runs (verdict, created_at desc);
create index if not exists analysis_runs_webhook_status_created_at_idx
  on public.analysis_runs (webhook_status, created_at desc);

-- Admin role helper functions
create or replace function public.is_admin(uid uuid)
returns boolean as $$
  select exists(
    select 1 from public.profiles p
    where p.id = uid and p.role in ('admin','super_admin')
  );
$$ language sql stable;

create or replace function public.is_super_admin(uid uuid)
returns boolean as $$
  select exists(
    select 1 from public.profiles p
    where p.id = uid and p.role = 'super_admin'
  );
$$ language sql stable;

-- Admin aggregate helpers
create or replace function public.admin_run_counts(user_ids uuid[])
returns table (user_id uuid, run_count bigint)
language sql stable
as $$
  select user_id, count(*)
  from public.analysis_runs
  where user_id = any(user_ids)
  group by user_id;
$$;

create or replace function public.admin_overview_stats()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  total_users bigint;
  new_users_7d bigint;
  new_users_30d bigint;
  total_runs bigint;
  runs_7d bigint;
  runs_30d bigint;
  errors bigint;
  verdict_dist jsonb;
  avg_conf jsonb;
begin
  select count(*) into total_users from auth.users;
  select count(*) into new_users_7d from auth.users where created_at >= now() - interval '7 days';
  select count(*) into new_users_30d from auth.users where created_at >= now() - interval '30 days';

  select count(*) into total_runs from public.analysis_runs;
  select count(*) into runs_7d from public.analysis_runs where created_at >= now() - interval '7 days';
  select count(*) into runs_30d from public.analysis_runs where created_at >= now() - interval '30 days';
  select count(*) into errors from public.analysis_runs where webhook_status in ('error','timeout');

  select jsonb_object_agg(coalesce(verdict, 'Unknown'), run_count)
  into verdict_dist
  from (
    select verdict, count(*) as run_count
    from public.analysis_runs
    group by verdict
  ) as verdict_counts;

  select jsonb_object_agg(coalesce(verdict, 'Unknown'), avg_confidence)
  into avg_conf
  from (
    select verdict, round(avg(confidence), 2) as avg_confidence
    from public.analysis_runs
    group by verdict
  ) as confidence_avgs;

  return jsonb_build_object(
    'total_users', total_users,
    'new_users_7d', new_users_7d,
    'new_users_30d', new_users_30d,
    'total_runs', total_runs,
    'runs_7d', runs_7d,
    'runs_30d', runs_30d,
    'error_rate', case when total_runs = 0 then 0 else errors::numeric / total_runs end,
    'verdict_distribution', coalesce(verdict_dist, '{}'::jsonb),
    'avg_confidence_by_verdict', coalesce(avg_conf, '{}'::jsonb)
  );
end;
$$;

-- App settings
create table if not exists public.app_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id)
);

-- Admin audit log
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  before jsonb,
  after jsonb,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_actor_created_at_idx
  on public.admin_audit_log (actor_id, created_at desc);
create index if not exists admin_audit_log_action_created_at_idx
  on public.admin_audit_log (action, created_at desc);

-- Impersonation sessions
create table if not exists public.impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id),
  target_user_id uuid references auth.users(id),
  token_hash text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.app_settings enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.impersonation_sessions enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Analysis runs policies
create policy "analysis_runs_select_own"
  on public.analysis_runs for select
  using (auth.uid() = user_id);

create policy "analysis_runs_insert_own"
  on public.analysis_runs for insert
  with check (auth.uid() = user_id);

-- App settings policies (no client access)
create policy "app_settings_read_public"
  on public.app_settings for select
  using (key in ('maintenance_mode','enable_tips','enable_rerun','analysis_timeout_seconds','daily_run_limit'));
create policy "app_settings_no_write"
  on public.app_settings for insert
  with check (false);
create policy "app_settings_no_update"
  on public.app_settings for update
  using (false);

-- Admin audit log policies (no client access)
create policy "admin_audit_log_no_select"
  on public.admin_audit_log for select
  using (false);
create policy "admin_audit_log_no_write"
  on public.admin_audit_log for insert
  with check (false);

-- Impersonation sessions policies (no client access)
create policy "impersonation_sessions_no_access"
  on public.impersonation_sessions for all
  using (false);

-- Seed settings
insert into public.app_settings (key, value)
values
  ('n8n_webhook_url', to_jsonb(''::text)),
  ('n8n_backup_url', to_jsonb(''::text)),
  ('analysis_timeout_seconds', to_jsonb(20)),
  ('analysis_retry_count', to_jsonb(0)),
  ('maintenance_mode', to_jsonb(false)),
  ('daily_run_limit', to_jsonb(50)),
  ('enable_tips', to_jsonb(true)),
  ('enable_rerun', to_jsonb(true))
on conflict (key) do nothing;
