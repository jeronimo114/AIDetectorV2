-- Seed admin profile (replace with your auth user id)
-- update public.profiles set role = 'super_admin' where id = '00000000-0000-0000-0000-000000000000';

-- Backfill analysis_runs from detector_runs (optional)
insert into public.analysis_runs (
  id,
  user_id,
  input_text,
  char_count,
  verdict,
  confidence,
  breakdown,
  signals,
  model,
  webhook_status,
  error_message,
  raw_response,
  created_at
)
select
  d.id,
  d.user_id,
  d.input_text,
  length(d.input_text) as char_count,
  case d.result_label
    when 'likely_ai' then 'Likely AI'
    when 'unclear' then 'Unclear'
    when 'likely_human' then 'Likely Human'
    else null
  end as verdict,
  round((d.result_score * 100)::numeric, 2) as confidence,
  d.meta->'breakdown' as breakdown,
  d.meta->'signals' as signals,
  d.model,
  'success' as webhook_status,
  null as error_message,
  d.meta as raw_response,
  d.created_at
from public.detector_runs d
on conflict (id) do nothing;
