do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'detector_runs'
  ) then
    execute 'alter table public.detector_runs enable row level security';

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'detector_runs' and policyname = 'detector_runs_select_own'
    ) then
      execute 'create policy "detector_runs_select_own" on public.detector_runs for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'detector_runs' and policyname = 'detector_runs_insert_own'
    ) then
      execute 'create policy "detector_runs_insert_own" on public.detector_runs for insert with check (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'detector_runs' and policyname = 'detector_runs_delete_own'
    ) then
      execute 'create policy "detector_runs_delete_own" on public.detector_runs for delete using (auth.uid() = user_id)';
    end if;
  end if;
end $$;
