-- FEAT-035: 비회원 이용 기록 1년 파기 (개인정보 처리방침 제3조)
-- 실행: Supabase 대시보드 → Integrations → Cron(pg_cron) 활성화 후 SQL Editor에서 전체 실행

-- 마지막 이용(events.created_at · user_taste.updated_at 중 최신)이 1년 넘은 비회원 user_id의 기록 삭제. 삭제한 user_id 수를 반환
create or replace function public.purge_stale_anon()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ids text[];
begin
  -- ponytail: 매일 events 전체 집계(지금 3천 행). 수십만 행이 되면 user_id별 last_seen 컬럼으로 바꾼다
  select array_agg(user_id) into ids
  from (
    select user_id, max(at) as last_seen
    from (
      select user_id, created_at as at from events
      union all
      select user_id, updated_at from user_taste
    ) s
    group by user_id
  ) l
  where l.last_seen < now() - interval '1 year'
    and not exists (select 1 from auth.users u where u.id::text = l.user_id);

  delete from events where user_id = any(ids);
  delete from user_taste where user_id = any(ids);
  return coalesce(array_length(ids, 1), 0);
end;
$$;

-- 앱(anon·authenticated)에서는 호출 못 하게 막고, 검증용으로 service_role만 허용
revoke execute on function public.purge_stale_anon() from public, anon, authenticated;
grant execute on function public.purge_stale_anon() to service_role;

-- 매일 03:00 KST(18:00 UTC). 같은 이름이면 덮어쓴다
select cron.schedule('purge-stale-anon', '0 18 * * *', 'select public.purge_stale_anon()');
