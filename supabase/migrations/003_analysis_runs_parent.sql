do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'analysis_runs'
  ) then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'analysis_runs'
        and column_name = 'parent_run_id'
    ) then
      alter table public.analysis_runs add column parent_run_id uuid;
    end if;

    if not exists (
      select 1
      from information_schema.table_constraints
      where table_schema = 'public'
        and table_name = 'analysis_runs'
        and constraint_name = 'analysis_runs_parent_run_id_fkey'
    ) then
      alter table public.analysis_runs
        add constraint analysis_runs_parent_run_id_fkey
        foreign key (parent_run_id) references public.analysis_runs(id);
    end if;

    create index if not exists analysis_runs_parent_run_id_idx
      on public.analysis_runs (parent_run_id);
  end if;
end $$;
